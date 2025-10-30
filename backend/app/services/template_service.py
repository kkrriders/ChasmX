from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime
from bson import ObjectId
from loguru import logger

from ..models.template import (
    Template, 
    TemplateFilter, 
    TemplateSortBy, 
    TemplateSortOrder,
    TemplateStatus,
    TemplateVisibility,
    TemplateCategory,
    TemplateComplexity,
    TemplateMetadata,
    TemplateRequirements,
    TemplateVersion
)
from ..models.workflow import Workflow, WorkflowStatus, Node, Edge, WorkflowVariable, Metadata
from ..crud.template import template_crud
from ..services.workflow_validator import workflow_validator, ValidationResult, ValidationIssue, ValidationSeverity


class TemplateService:
    """Business logic service for template management"""
    
    @staticmethod
    async def create_template_from_workflow(
        workflow_id: str,
        template_metadata: TemplateMetadata,
        user_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        visibility: TemplateVisibility = TemplateVisibility.PRIVATE
    ) -> Optional[Template]:
        """Create a template from an existing workflow"""
        try:
            # Get the source workflow
            workflow = await Workflow.get(ObjectId(workflow_id))
            if not workflow:
                logger.error(f"Workflow not found: {workflow_id}")
                return None
            
            # Generate unique slug
            slug = TemplateService._generate_slug(template_metadata.description)
            
            # Ensure slug is unique
            existing = await template_crud.get_template_by_slug(slug)
            if existing:
                slug = f"{slug}-{int(datetime.utcnow().timestamp())}"
            
            # Create template data
            template_data = {
                "name": workflow.name,
                "slug": slug,
                "nodes": workflow.nodes,
                "edges": workflow.edges,
                "variables": workflow.variables,
                "metadata": template_metadata,
                "status": TemplateStatus.DRAFT,
                "visibility": visibility,
                "created_by": user_id,
                "organization_id": organization_id,
                "version_info": TemplateVersion(
                    version="1.0.0",
                    changelog="Initial version created from workflow",
                    created_by=user_id
                )
            }
            
            # Create the template
            template = await template_crud.create_template(template_data)
            
            logger.info(f"Template created from workflow: {template.id}")
            return template
            
        except Exception as e:
            logger.error(f"Failed to create template from workflow: {str(e)}")
            return None
    
    @staticmethod
    async def validate_template(template_id: str) -> ValidationResult:
        """Validate a template's workflow structure"""
        try:
            template = await template_crud.get_template_by_id(template_id)
            if not template:
                return ValidationResult(
                    is_valid=False,
                    errors=[ValidationIssue(
                        severity=ValidationSeverity.ERROR,
                        code="TEMPLATE_NOT_FOUND",
                        message="Template not found"
                    )],
                    warnings=[],
                    info=[]
                )
            
            # Create a temporary workflow for validation
            temp_workflow = Workflow(
                name=template.name,
                nodes=template.nodes,
                edges=template.edges,
                variables=template.variables,
                status=WorkflowStatus.DRAFT,
                metadata=Metadata(
                    description=template.metadata.description,
                    tags=template.metadata.tags,
                    author=template.metadata.author,
                    version=template.version_info.version
                ),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            # Validate using workflow validator
            validation_result = workflow_validator.validate_workflow(temp_workflow)
            return validation_result
            
        except Exception as e:
            logger.error(f"Failed to validate template: {str(e)}")
            return ValidationResult(
                is_valid=False,
                errors=[ValidationIssue(
                    severity=ValidationSeverity.ERROR,
                    code="VALIDATION_ERROR",
                    message=f"Validation failed: {str(e)}"
                )],
                warnings=[],
                info=[]
            )
    
    @staticmethod
    async def publish_template(
        template_id: str,
        user_id: str,
        force_publish: bool = False
    ) -> Tuple[bool, str]:
        """Publish a template (change status to published)"""
        try:
            template = await template_crud.get_template_by_id(template_id)
            if not template:
                return False, "Template not found"
            
            # Check permissions
            if template.created_by != user_id:
                return False, "Only the template creator can publish it"
            
            # Validate template before publishing (unless forced)
            if not force_publish:
                validation_result = await TemplateService.validate_template(template_id)
                if not validation_result.is_valid:
                    error_messages = [error.message for error in validation_result.errors]
                    return False, f"Template validation failed: {', '.join(error_messages)}"
            
            # Update template status
            update_data = {
                "status": TemplateStatus.PUBLISHED,
                "published_at": datetime.utcnow()
            }
            
            updated_template = await template_crud.update_template(template_id, update_data)
            if not updated_template:
                return False, "Failed to update template status"
            
            logger.info(f"Template published: {template_id}")
            return True, "Template published successfully"
            
        except Exception as e:
            logger.error(f"Failed to publish template: {str(e)}")
            return False, f"Failed to publish template: {str(e)}"
    
    @staticmethod
    async def unpublish_template(template_id: str, user_id: str) -> Tuple[bool, str]:
        """Unpublish a template (change status back to draft)"""
        try:
            template = await template_crud.get_template_by_id(template_id)
            if not template:
                return False, "Template not found"
            
            # Check permissions
            if template.created_by != user_id:
                return False, "Only the template creator can unpublish it"
            
            # Update template status
            update_data = {
                "status": TemplateStatus.DRAFT,
                "published_at": None
            }
            
            updated_template = await template_crud.update_template(template_id, update_data)
            if not updated_template:
                return False, "Failed to update template status"
            
            logger.info(f"Template unpublished: {template_id}")
            return True, "Template unpublished successfully"
            
        except Exception as e:
            logger.error(f"Failed to unpublish template: {str(e)}")
            return False, f"Failed to unpublish template: {str(e)}"
    
    @staticmethod
    async def clone_template(
        template_id: str,
        new_name: str,
        user_id: str,
        organization_id: Optional[str] = None
    ) -> Optional[Template]:
        """Clone an existing template"""
        try:
            # Get source template
            source_template = await template_crud.get_template_by_id(template_id)
            if not source_template:
                logger.error(f"Source template not found: {template_id}")
                return None
            
            # Check if user can access the template
            if (source_template.visibility == TemplateVisibility.PRIVATE and 
                source_template.created_by != user_id):
                logger.error(f"User {user_id} cannot access private template {template_id}")
                return None
            
            # Generate unique slug for cloned template
            slug = TemplateService._generate_slug(new_name)
            existing = await template_crud.get_template_by_slug(slug)
            if existing:
                slug = f"{slug}-{int(datetime.utcnow().timestamp())}"
            
            # Create cloned template data
            cloned_metadata = source_template.metadata.model_copy()
            cloned_metadata.description = f"Cloned from: {source_template.name}"
            
            template_data = {
                "name": new_name,
                "slug": slug,
                "nodes": source_template.nodes,
                "edges": source_template.edges,
                "variables": source_template.variables,
                "metadata": cloned_metadata,
                "status": TemplateStatus.DRAFT,
                "visibility": TemplateVisibility.PRIVATE,
                "created_by": user_id,
                "organization_id": organization_id,
                "parent_template_id": source_template.id,
                "version_info": TemplateVersion(
                    version="1.0.0",
                    changelog=f"Cloned from template: {source_template.name}",
                    created_by=user_id
                )
            }
            
            # Create the cloned template
            cloned_template = await template_crud.create_template(template_data)
            
            # Update source template download count
            source_template.increment_download_count()
            await source_template.save()
            
            logger.info(f"Template cloned: {template_id} -> {cloned_template.id}")
            return cloned_template
            
        except Exception as e:
            logger.error(f"Failed to clone template: {str(e)}")
            return None
    
    @staticmethod
    async def search_templates_advanced(
        query: Optional[str] = None,
        filters: Optional[TemplateFilter] = None,
        sort_by: TemplateSortBy = TemplateSortBy.CREATED_AT,
        sort_order: TemplateSortOrder = TemplateSortOrder.DESC,
        page: int = 1,
        page_size: int = 20,
        user_id: Optional[str] = None,
        organization_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Advanced template search with pagination and metadata"""
        try:
            # Calculate pagination
            skip = (page - 1) * page_size
            limit = page_size
            
            # Get templates
            templates = await template_crud.list_templates(
                filters=filters,
                sort_by=sort_by,
                sort_order=sort_order,
                skip=skip,
                limit=limit,
                user_id=user_id,
                organization_id=organization_id
            )
            
            # Get total count (simplified - in production, use aggregation)
            total_count = len(templates) + skip  # This is approximate
            
            # Calculate pagination metadata
            total_pages = (total_count + page_size - 1) // page_size
            has_next = page < total_pages
            has_prev = page > 1
            
            return {
                "templates": templates,
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total_count": total_count,
                    "total_pages": total_pages,
                    "has_next": has_next,
                    "has_prev": has_prev
                },
                "filters_applied": filters.model_dump() if filters else None,
                "sort": {
                    "sort_by": sort_by,
                    "sort_order": sort_order
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to search templates: {str(e)}")
            return {
                "templates": [],
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total_count": 0,
                    "total_pages": 0,
                    "has_next": False,
                    "has_prev": False
                },
                "error": str(e)
            }
    
    @staticmethod
    async def get_template_analytics(template_id: str) -> Dict[str, Any]:
        """Get analytics data for a template"""
        try:
            template = await template_crud.get_template_by_id(template_id)
            if not template:
                return {"error": "Template not found"}
            
            # Basic analytics from template metrics
            analytics = {
                "template_id": template_id,
                "basic_metrics": {
                    "download_count": template.metrics.download_count,
                    "deployment_count": template.metrics.deployment_count,
                    "success_rate": template.metrics.success_rate,
                    "average_rating": template.metrics.average_rating,
                    "total_ratings": template.metrics.total_ratings,
                    "last_used": template.metrics.last_used
                },
                "engagement": {
                    "featured": template.featured,
                    "verified": template.verified,
                    "visibility": template.visibility.value,
                    "status": template.status.value
                },
                "metadata": {
                    "category": template.metadata.category.value,
                    "complexity": template.metadata.complexity.value,
                    "tags": template.metadata.tags,
                    "industries": template.metadata.industries,
                    "use_cases": template.metadata.use_cases
                },
                "timeline": {
                    "created_at": template.created_at,
                    "updated_at": template.updated_at,
                    "published_at": template.published_at
                }
            }
            
            return analytics
            
        except Exception as e:
            logger.error(f"Failed to get template analytics: {str(e)}")
            return {"error": str(e)}
    
    @staticmethod
    async def get_recommended_templates(
        user_id: Optional[str] = None,
        based_on_template: Optional[str] = None,
        limit: int = 10
    ) -> List[Template]:
        """Get recommended templates for a user"""
        try:
            # Simple recommendation logic (would be more sophisticated in production)
            if based_on_template:
                # Get similar templates based on category and tags
                base_template = await template_crud.get_template_by_id(based_on_template)
                if base_template:
                    filters = TemplateFilter(
                        category=base_template.metadata.category,
                        tags=base_template.metadata.tags[:3]  # Use first 3 tags
                    )
                    return await template_crud.list_templates(
                        filters=filters,
                        sort_by=TemplateSortBy.RATING,
                        sort_order=TemplateSortOrder.DESC,
                        limit=limit
                    )
            
            # Default: return featured templates
            return await template_crud.get_featured_templates(limit=limit)
            
        except Exception as e:
            logger.error(f"Failed to get recommended templates: {str(e)}")
            return []
    
    @staticmethod
    def _generate_slug(name: str) -> str:
        """Generate URL-friendly slug from template name"""
        import re
        # Convert to lowercase, replace spaces and special chars with hyphens
        slug = re.sub(r'[^a-zA-Z0-9\s-]', '', name.lower())
        slug = re.sub(r'[\s-]+', '-', slug)
        slug = slug.strip('-')
        return slug[:50]  # Limit length
    
    @staticmethod
    async def update_template_version(
        template_id: str,
        version: str,
        changelog: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> Tuple[bool, str]:
        """Update template version information"""
        try:
            template = await template_crud.get_template_by_id(template_id)
            if not template:
                return False, "Template not found"
            
            # Check permissions
            if template.created_by != user_id:
                return False, "Only the template creator can update version"
            
            # Update version info
            new_version_info = TemplateVersion(
                version=version,
                changelog=changelog or f"Updated to version {version}",
                created_by=user_id
            )
            
            update_data = {
                "version_info": new_version_info,
                "updated_at": datetime.utcnow()
            }
            
            updated_template = await template_crud.update_template(template_id, update_data)
            if not updated_template:
                return False, "Failed to update template version"
            
            logger.info(f"Template version updated: {template_id} -> {version}")
            return True, f"Template updated to version {version}"
            
        except Exception as e:
            logger.error(f"Failed to update template version: {str(e)}")
            return False, f"Failed to update version: {str(e)}"


# Convenience instance
template_service = TemplateService()