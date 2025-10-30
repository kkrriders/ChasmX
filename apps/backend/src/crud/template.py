from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from beanie import PydanticObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from ..models.template import (
    Template, 
    TemplateFilter, 
    TemplateSortBy, 
    TemplateSortOrder,
    TemplateStatus,
    TemplateVisibility,
    TemplateCategory,
    TemplateComplexity
)
from ..models.workflow import Workflow, WorkflowStatus


class TemplateCRUD:
    """CRUD operations for Template model"""
    
    @staticmethod
    async def create_template(template_data: Dict[str, Any]) -> Template:
        """Create a new template"""
        template = Template(**template_data)
        template.created_at = datetime.utcnow()
        template.updated_at = datetime.utcnow()
        
        # Generate slug if not provided
        if not template.slug:
            template.slug = template.name.lower().replace(" ", "-").replace("_", "-")
        
        await template.insert()
        return template
    
    @staticmethod
    async def get_template_by_id(template_id: str) -> Optional[Template]:
        """Get template by ID"""
        try:
            object_id = ObjectId(template_id)
            return await Template.get(object_id)
        except Exception:
            return None
    
    @staticmethod
    async def get_template_by_slug(slug: str) -> Optional[Template]:
        """Get template by slug"""
        return await Template.find_one(Template.slug == slug)
    
    @staticmethod
    async def update_template(template_id: str, update_data: Dict[str, Any]) -> Optional[Template]:
        """Update an existing template"""
        try:
            object_id = ObjectId(template_id)
            template = await Template.get(object_id)
            
            if not template:
                return None
            
            # Update fields
            for field, value in update_data.items():
                if hasattr(template, field):
                    setattr(template, field, value)
            
            template.updated_at = datetime.utcnow()
            await template.save()
            return template
            
        except Exception:
            return None
    
    @staticmethod
    async def delete_template(template_id: str) -> bool:
        """Delete a template"""
        try:
            object_id = ObjectId(template_id)
            template = await Template.get(object_id)
            
            if not template:
                return False
            
            await template.delete()
            return True
            
        except Exception:
            return False
    
    @staticmethod
    async def list_templates(
        filters: Optional[TemplateFilter] = None,
        sort_by: TemplateSortBy = TemplateSortBy.CREATED_AT,
        sort_order: TemplateSortOrder = TemplateSortOrder.DESC,
        skip: int = 0,
        limit: int = 50,
        user_id: Optional[str] = None,
        organization_id: Optional[str] = None
    ) -> List[Template]:
        """List templates with filtering, sorting, and pagination"""
        
        # Start with base query for published templates
        query_conditions = [Template.status == TemplateStatus.PUBLISHED]
        
        # Apply filters
        if filters:
            # Visibility filter
            if user_id:
                # User can see their own templates, organization templates, and public templates
                # For now, just show public templates (would need proper $or logic in production)
                query_conditions.append(Template.visibility == TemplateVisibility.PUBLIC)
            else:
                # Anonymous users can only see public templates
                query_conditions.append(Template.visibility == TemplateVisibility.PUBLIC)
            
            # Category filter
            if filters.category:
                query_conditions.append(Template.metadata.category == filters.category)
            
            # Complexity filter
            if filters.complexity:
                query_conditions.append(Template.metadata.complexity == filters.complexity)
            
            # Author filter
            if filters.author:
                query_conditions.append(Template.metadata.author == filters.author)
            
            # Organization filter
            if filters.organization_id:
                query_conditions.append(Template.organization_id == filters.organization_id)
            
            # Featured only
            if filters.featured_only:
                query_conditions.append(Template.featured == True)
            
            # Verified only
            if filters.verified_only:
                query_conditions.append(Template.verified == True)
            
            # Minimum rating
            if filters.min_rating:
                query_conditions.append(Template.metrics.average_rating >= filters.min_rating)
        
        # Apply all conditions
        if query_conditions:
            query = Template.find(*query_conditions)
        else:
            query = Template.find()
        
        # Apply sorting using string notation
        if sort_order == TemplateSortOrder.DESC:
            sort_prefix = "-"
        else:
            sort_prefix = "+"
        
        if sort_by == TemplateSortBy.NAME:
            query = query.sort(f"{sort_prefix}name")
        elif sort_by == TemplateSortBy.CREATED_AT:
            query = query.sort(f"{sort_prefix}created_at")
        elif sort_by == TemplateSortBy.UPDATED_AT:
            query = query.sort(f"{sort_prefix}updated_at")
        elif sort_by == TemplateSortBy.DOWNLOAD_COUNT:
            query = query.sort(f"{sort_prefix}metrics.download_count")
        elif sort_by == TemplateSortBy.RATING:
            query = query.sort(f"{sort_prefix}metrics.average_rating")
        elif sort_by == TemplateSortBy.POPULARITY:
            query = query.sort(f"{sort_prefix}metrics.download_count")
        else:
            query = query.sort(f"{sort_prefix}created_at")
        
        # Apply pagination
        query = query.skip(skip).limit(limit)
        
        return await query.to_list()
    
    @staticmethod
    async def get_template_categories() -> List[Dict[str, Any]]:
        """Get all template categories with counts"""
        # In production, use MongoDB aggregation pipeline
        categories = []
        
        for category in TemplateCategory:
            count = await Template.find(
                Template.metadata.category == category,
                Template.status == TemplateStatus.PUBLISHED,
                Template.visibility == TemplateVisibility.PUBLIC
            ).count()
            
            categories.append({
                "name": category.value,
                "display_name": category.value.replace("_", " ").title(),
                "count": count
            })
        
        return categories
    
    @staticmethod
    async def get_popular_tags(limit: int = 20) -> List[Dict[str, Any]]:
        """Get most popular tags across all templates"""
        # This would use MongoDB aggregation in production
        # Simplified implementation for now
        tag_counts = {}
        
        templates = await Template.find(
            Template.status == TemplateStatus.PUBLISHED,
            Template.visibility == TemplateVisibility.PUBLIC
        ).to_list()
        
        for template in templates:
            for tag in template.metadata.tags:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        # Sort by count and return top tags
        sorted_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)
        
        return [
            {"name": tag, "count": count} 
            for tag, count in sorted_tags[:limit]
        ]
    
    @staticmethod
    async def get_featured_templates(limit: int = 10) -> List[Template]:
        """Get featured templates"""
        return await Template.find(
            Template.featured == True,
            Template.status == TemplateStatus.PUBLISHED,
            Template.visibility == TemplateVisibility.PUBLIC
        ).sort("-metrics.average_rating").limit(limit).to_list()
    
    @staticmethod
    async def search_templates(
        query: str,
        category: Optional[TemplateCategory] = None,
        limit: int = 20
    ) -> List[Template]:
        """Search templates by text query"""
        # In production, use MongoDB text search indexes
        # Simplified implementation using regex
        search_conditions = []
        
        # Basic text search (would use $text in production)
        templates = await Template.find(
            Template.status == TemplateStatus.PUBLISHED,
            Template.visibility == TemplateVisibility.PUBLIC
        ).to_list()
        
        # Filter by search term (simplified)
        query_lower = query.lower()
        filtered_templates = []
        
        for template in templates:
            if (query_lower in template.name.lower() or 
                query_lower in template.metadata.description.lower() or
                any(query_lower in tag.lower() for tag in template.metadata.tags)):
                
                if category is None or template.metadata.category == category:
                    filtered_templates.append(template)
        
        # Sort by relevance (simplified by rating for now)
        filtered_templates.sort(key=lambda t: t.metrics.average_rating, reverse=True)
        
        return filtered_templates[:limit]
    
    @staticmethod
    async def deploy_template_as_workflow(
        template_id: str,
        user_id: str,
        workflow_name: Optional[str] = None,
        custom_config: Optional[Dict[str, Any]] = None
    ) -> Optional[Workflow]:
        """Deploy a template as a new workflow"""
        template = None
        try:
            # Get template
            template = await TemplateCRUD.get_template_by_id(template_id)
            if not template:
                return None
            
            # Convert template to workflow format
            workflow_data = template.to_workflow_dict()
            
            # Customize workflow name if provided
            if workflow_name:
                workflow_data["name"] = workflow_name
            
            # Apply custom configuration if provided
            if custom_config:
                # Apply custom config to nodes, variables, etc.
                # This would be more sophisticated in production
                pass
            
            # Create workflow
            workflow = Workflow(
                name=workflow_data["name"],
                nodes=workflow_data["nodes"],
                edges=workflow_data["edges"],
                variables=workflow_data["variables"],
                status=WorkflowStatus.DRAFT,
                metadata=workflow_data["metadata"],
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            await workflow.insert()
            
            # Update template metrics
            template.increment_deployment_count(success=True)
            await template.save()
            
            return workflow
            
        except Exception as e:
            # Update template metrics for failed deployment
            if template:
                template.increment_deployment_count(success=False)
                await template.save()
            return None
    
    @staticmethod
    async def add_template_rating(
        template_id: str,
        user_id: str,
        rating: int,
        review: Optional[str] = None
    ) -> Optional[Template]:
        """Add or update a user's rating for a template"""
        try:
            template = await TemplateCRUD.get_template_by_id(template_id)
            if not template:
                return None
            
            template.add_rating(user_id, rating, review)
            await template.save()
            
            return template
            
        except Exception:
            return None
    
    @staticmethod
    async def get_user_templates(
        user_id: str,
        status: Optional[TemplateStatus] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[Template]:
        """Get templates created by a specific user"""
        query = Template.find(Template.created_by == user_id)
        
        if status:
            query = query.find(Template.status == status)
        
        return await query.sort("-updated_at").skip(skip).limit(limit).to_list()
    
    @staticmethod
    async def get_organization_templates(
        organization_id: str,
        skip: int = 0,
        limit: int = 50
    ) -> List[Template]:
        """Get templates belonging to an organization"""
        return await Template.find(
            Template.organization_id == organization_id
        ).sort("-updated_at").skip(skip).limit(limit).to_list()


# Convenience instance
template_crud = TemplateCRUD()