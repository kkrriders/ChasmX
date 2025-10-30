from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends, Query
from fastapi.responses import JSONResponse
from loguru import logger

from ..models.template import (
    Template,
    TemplateStatus,
    TemplateVisibility,
    TemplateCategory,
    TemplateComplexity,
    TemplateSortBy,
    TemplateSortOrder,
    TemplateFilter
)
from ..schemas.template import (
    CreateTemplateRequest,
    UpdateTemplateRequest,
    CreateTemplateFromWorkflowRequest,
    DeployTemplateRequest,
    CloneTemplateRequest,
    AddTemplateRatingRequest,
    TemplateSearchRequest,
    UpdateTemplateVersionRequest,
    TemplateResponse,
    TemplateDetailResponse,
    TemplateSummaryResponse,
    TemplateSearchResponse,
    TemplateCategoryResponse,
    TemplateTagResponse,
    TemplateAnalyticsResponse,
    TemplateValidationResponse,
    TemplateOperationResponse,
    TemplateStatsResponse,
    TemplateListResponse,
    BulkTemplateOperation,
    BulkOperationResponse
)
from ..services.template_service import template_service
from ..crud.template import template_crud

router = APIRouter(
    prefix="/templates",
    tags=["templates"]
)

# Template CRUD Endpoints

@router.post("/", response_model=TemplateDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_template(request: CreateTemplateRequest) -> TemplateDetailResponse:
    """Create a new template"""
    try:
        template_data = request.model_dump()
        template = await template_crud.create_template(template_data)
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create template"
            )
        
        return TemplateDetailResponse.from_template(template)
        
    except Exception as e:
        logger.error(f"Failed to create template: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create template: {str(e)}"
        )


@router.get("/", response_model=TemplateListResponse)
async def list_templates(
    category: Optional[TemplateCategory] = None,
    tags: Optional[List[str]] = Query(None),
    complexity: Optional[TemplateComplexity] = None,
    author: Optional[str] = None,
    featured_only: bool = False,
    verified_only: bool = False,
    min_rating: Optional[float] = Query(None, ge=0, le=5),
    sort_by: TemplateSortBy = TemplateSortBy.CREATED_AT,
    sort_order: TemplateSortOrder = TemplateSortOrder.DESC,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_id: Optional[str] = None,  # Would come from auth in production
    organization_id: Optional[str] = None
) -> TemplateListResponse:
    """List templates with filtering and pagination"""
    try:
        # Build filters
        filters = TemplateFilter(
            category=category,
            tags=tags,
            complexity=complexity,
            author=author,
            featured_only=featured_only,
            verified_only=verified_only,
            min_rating=min_rating
        )
        
        # Get search results
        search_result = await template_service.search_templates_advanced(
            filters=filters,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size,
            user_id=user_id,
            organization_id=organization_id
        )
        
        # Convert to response format
        template_responses = [
            TemplateSummaryResponse.from_template(template) 
            for template in search_result["templates"]
        ]
        
        return TemplateListResponse(
            templates=template_responses,
            pagination=search_result["pagination"]
        )
        
    except Exception as e:
        logger.error(f"Failed to list templates: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list templates: {str(e)}"
        )


@router.get("/{template_id}", response_model=TemplateDetailResponse)
async def get_template(template_id: str) -> TemplateDetailResponse:
    """Get template by ID"""
    try:
        template = await template_crud.get_template_by_id(template_id)
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Template with ID {template_id} not found"
            )
        
        # Increment download count (view count)
        template.increment_download_count()
        await template.save()
        
        return TemplateDetailResponse.from_template(template)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get template: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get template: {str(e)}"
        )


@router.put("/{template_id}", response_model=TemplateDetailResponse)
async def update_template(
    template_id: str, 
    request: UpdateTemplateRequest,
    user_id: str = "current_user"  # Would come from auth dependency
) -> TemplateDetailResponse:
    """Update an existing template"""
    try:
        # Check if template exists and user has permission
        template = await template_crud.get_template_by_id(template_id)
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Template with ID {template_id} not found"
            )
        
        if template.created_by != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the template creator can update it"
            )
        
        # Update template
        update_data = request.model_dump(exclude_unset=True)
        updated_template = await template_crud.update_template(template_id, update_data)
        
        if not updated_template:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update template"
            )
        
        return TemplateDetailResponse.from_template(updated_template)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update template: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update template: {str(e)}"
        )


@router.delete("/{template_id}", response_model=TemplateOperationResponse)
async def delete_template(
    template_id: str,
    user_id: str = "current_user"  # Would come from auth dependency
) -> TemplateOperationResponse:
    """Delete a template"""
    try:
        # Check if template exists and user has permission
        template = await template_crud.get_template_by_id(template_id)
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Template with ID {template_id} not found"
            )
        
        if template.created_by != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the template creator can delete it"
            )
        
        # Delete template
        success = await template_crud.delete_template(template_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to delete template"
            )
        
        return TemplateOperationResponse(
            success=True,
            message="Template deleted successfully",
            template_id=template_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete template: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete template: {str(e)}"
        )


# Template Management Endpoints

@router.post("/from-workflow", response_model=TemplateDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_template_from_workflow(
    request: CreateTemplateFromWorkflowRequest,
    user_id: str = "current_user"  # Would come from auth dependency
) -> TemplateDetailResponse:
    """Create a template from an existing workflow"""
    try:
        template = await template_service.create_template_from_workflow(
            workflow_id=request.workflow_id,
            template_metadata=request.metadata,
            user_id=user_id,
            organization_id=request.organization_id,
            visibility=request.visibility
        )
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create template from workflow"
            )
        
        return TemplateDetailResponse.from_template(template)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create template from workflow: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create template from workflow: {str(e)}"
        )


@router.post("/{template_id}/deploy", response_model=TemplateOperationResponse)
async def deploy_template(
    template_id: str,
    request: DeployTemplateRequest,
    user_id: str = "current_user"  # Would come from auth dependency
) -> TemplateOperationResponse:
    """Deploy a template as a new workflow"""
    try:
        workflow = await template_crud.deploy_template_as_workflow(
            template_id=template_id,
            user_id=user_id,
            workflow_name=request.workflow_name,
            custom_config=request.custom_config
        )
        
        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to deploy template as workflow"
            )
        
        return TemplateOperationResponse(
            success=True,
            message="Template deployed successfully",
            template_id=template_id,
            workflow_id=str(workflow.id)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to deploy template: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to deploy template: {str(e)}"
        )


@router.post("/{template_id}/clone", response_model=TemplateDetailResponse)
async def clone_template(
    template_id: str,
    request: CloneTemplateRequest,
    user_id: str = "current_user"  # Would come from auth dependency
) -> TemplateDetailResponse:
    """Clone an existing template"""
    try:
        cloned_template = await template_service.clone_template(
            template_id=template_id,
            new_name=request.new_name,
            user_id=user_id,
            organization_id=request.organization_id
        )
        
        if not cloned_template:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to clone template"
            )
        
        return TemplateDetailResponse.from_template(cloned_template)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to clone template: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clone template: {str(e)}"
        )


@router.post("/{template_id}/publish", response_model=TemplateOperationResponse)
async def publish_template(
    template_id: str,
    force: bool = False,
    user_id: str = "current_user"  # Would come from auth dependency
) -> TemplateOperationResponse:
    """Publish a template"""
    try:
        success, message = await template_service.publish_template(
            template_id=template_id,
            user_id=user_id,
            force_publish=force
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )
        
        return TemplateOperationResponse(
            success=True,
            message=message,
            template_id=template_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to publish template: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to publish template: {str(e)}"
        )


@router.post("/{template_id}/unpublish", response_model=TemplateOperationResponse)
async def unpublish_template(
    template_id: str,
    user_id: str = "current_user"  # Would come from auth dependency
) -> TemplateOperationResponse:
    """Unpublish a template"""
    try:
        success, message = await template_service.unpublish_template(
            template_id=template_id,
            user_id=user_id
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )
        
        return TemplateOperationResponse(
            success=True,
            message=message,
            template_id=template_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to unpublish template: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unpublish template: {str(e)}"
        )


# Template Discovery and Analytics

@router.get("/categories", response_model=List[TemplateCategoryResponse])
async def get_template_categories() -> List[TemplateCategoryResponse]:
    """Get all template categories with counts"""
    try:
        categories = await template_crud.get_template_categories()
        return [TemplateCategoryResponse(**cat) for cat in categories]
        
    except Exception as e:
        logger.error(f"Failed to get template categories: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get template categories: {str(e)}"
        )


@router.get("/tags/popular", response_model=List[TemplateTagResponse])
async def get_popular_tags(limit: int = Query(20, ge=1, le=50)) -> List[TemplateTagResponse]:
    """Get popular template tags"""
    try:
        tags = await template_crud.get_popular_tags(limit=limit)
        return [TemplateTagResponse(**tag) for tag in tags]
        
    except Exception as e:
        logger.error(f"Failed to get popular tags: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get popular tags: {str(e)}"
        )


@router.get("/featured", response_model=List[TemplateSummaryResponse])
async def get_featured_templates(limit: int = Query(10, ge=1, le=50)) -> List[TemplateSummaryResponse]:
    """Get featured templates"""
    try:
        templates = await template_crud.get_featured_templates(limit=limit)
        return [TemplateSummaryResponse.from_template(template) for template in templates]
        
    except Exception as e:
        logger.error(f"Failed to get featured templates: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get featured templates: {str(e)}"
        )


@router.get("/recommended", response_model=List[TemplateSummaryResponse])
async def get_recommended_templates(
    based_on: Optional[str] = None,
    limit: int = Query(10, ge=1, le=50),
    user_id: str = "current_user"  # Would come from auth dependency
) -> List[TemplateSummaryResponse]:
    """Get recommended templates"""
    try:
        templates = await template_service.get_recommended_templates(
            user_id=user_id,
            based_on_template=based_on,
            limit=limit
        )
        return [TemplateSummaryResponse.from_template(template) for template in templates]
        
    except Exception as e:
        logger.error(f"Failed to get recommended templates: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get recommended templates: {str(e)}"
        )


@router.post("/search", response_model=TemplateSearchResponse)
async def search_templates(request: TemplateSearchRequest) -> TemplateSearchResponse:
    """Advanced template search"""
    try:
        # Build filters from request
        filters = TemplateFilter(
            category=request.category,
            tags=request.tags,
            complexity=request.complexity,
            author=request.author,
            featured_only=request.featured_only,
            verified_only=request.verified_only,
            min_rating=request.min_rating,
            search_query=request.query
        )
        
        # Get search results
        search_result = await template_service.search_templates_advanced(
            query=request.query,
            filters=filters,
            sort_by=request.sort_by,
            sort_order=request.sort_order,
            page=request.page,
            page_size=request.page_size
        )
        
        # Convert to response format
        template_responses = [
            TemplateSummaryResponse.from_template(template) 
            for template in search_result["templates"]
        ]
        
        return TemplateSearchResponse(
            templates=template_responses,
            pagination=search_result["pagination"],
            filters_applied=search_result["filters_applied"],
            sort=search_result["sort"]
        )
        
    except Exception as e:
        logger.error(f"Failed to search templates: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search templates: {str(e)}"
        )


# Template Validation and Analytics

@router.post("/{template_id}/validate", response_model=TemplateValidationResponse)
async def validate_template(template_id: str) -> TemplateValidationResponse:
    """Validate a template's workflow structure"""
    try:
        validation_result = await template_service.validate_template(template_id)
        
        return TemplateValidationResponse(
            is_valid=validation_result.is_valid,
            errors=[issue.model_dump() for issue in validation_result.errors],
            warnings=[issue.model_dump() for issue in validation_result.warnings],
            info=[issue.model_dump() for issue in validation_result.info]
        )
        
    except Exception as e:
        logger.error(f"Failed to validate template: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to validate template: {str(e)}"
        )


@router.get("/{template_id}/analytics", response_model=TemplateAnalyticsResponse)
async def get_template_analytics(template_id: str) -> TemplateAnalyticsResponse:
    """Get analytics data for a template"""
    try:
        analytics = await template_service.get_template_analytics(template_id)
        
        if "error" in analytics:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=analytics["error"]
            )
        
        return TemplateAnalyticsResponse(**analytics)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get template analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get template analytics: {str(e)}"
        )


@router.post("/{template_id}/rate", response_model=TemplateOperationResponse)
async def rate_template(
    template_id: str,
    request: AddTemplateRatingRequest,
    user_id: str = "current_user"  # Would come from auth dependency
) -> TemplateOperationResponse:
    """Add or update a rating for a template"""
    try:
        template = await template_crud.add_template_rating(
            template_id=template_id,
            user_id=user_id,
            rating=request.rating,
            review=request.review
        )
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )
        
        return TemplateOperationResponse(
            success=True,
            message="Rating added successfully",
            template_id=template_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to rate template: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to rate template: {str(e)}"
        )


@router.put("/{template_id}/version", response_model=TemplateOperationResponse)
async def update_template_version(
    template_id: str,
    request: UpdateTemplateVersionRequest,
    user_id: str = "current_user"  # Would come from auth dependency
) -> TemplateOperationResponse:
    """Update template version information"""
    try:
        success, message = await template_service.update_template_version(
            template_id=template_id,
            version=request.version,
            changelog=request.changelog,
            user_id=user_id
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )
        
        return TemplateOperationResponse(
            success=True,
            message=message,
            template_id=template_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update template version: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update template version: {str(e)}"
        )