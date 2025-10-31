from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from bson import ObjectId

from ..models.template import (
    TemplateStatus,
    TemplateVisibility,
    TemplateCategory,
    TemplateComplexity,
    TemplateSortBy,
    TemplateSortOrder,
    TemplateMetadata,
    TemplateMetrics,
    TemplateVersion,
    TemplateRequirements,
    TemplateRating
)
from ..models.workflow import Node, Edge, WorkflowVariable


# Request Models
class CreateTemplateRequest(BaseModel):
    """Request to create a new template"""
    name: str = Field(..., min_length=1, max_length=100)
    slug: Optional[str] = None
    nodes: List[Node]
    edges: List[Edge]
    variables: List[WorkflowVariable] = []
    metadata: TemplateMetadata
    visibility: TemplateVisibility = TemplateVisibility.PRIVATE
    organization_id: Optional[str] = None


class UpdateTemplateRequest(BaseModel):
    """Request to update an existing template"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    nodes: Optional[List[Node]] = None
    edges: Optional[List[Edge]] = None
    variables: Optional[List[WorkflowVariable]] = None
    metadata: Optional[TemplateMetadata] = None
    visibility: Optional[TemplateVisibility] = None
    status: Optional[TemplateStatus] = None


class CreateTemplateFromWorkflowRequest(BaseModel):
    """Request to create template from existing workflow"""
    workflow_id: str
    metadata: TemplateMetadata
    visibility: TemplateVisibility = TemplateVisibility.PRIVATE
    organization_id: Optional[str] = None


class DeployTemplateRequest(BaseModel):
    """Request to deploy template as workflow"""
    workflow_name: Optional[str] = None
    custom_config: Optional[Dict[str, Any]] = None


class CloneTemplateRequest(BaseModel):
    """Request to clone an existing template"""
    new_name: str = Field(..., min_length=1, max_length=100)
    organization_id: Optional[str] = None


class AddTemplateRatingRequest(BaseModel):
    """Request to add/update template rating"""
    rating: int = Field(..., ge=1, le=5)
    review: Optional[str] = None


class TemplateSearchRequest(BaseModel):
    """Request for advanced template search"""
    query: Optional[str] = None
    category: Optional[TemplateCategory] = None
    tags: Optional[List[str]] = None
    complexity: Optional[TemplateComplexity] = None
    author: Optional[str] = None
    featured_only: bool = False
    verified_only: bool = False
    min_rating: Optional[float] = Field(None, ge=0, le=5)
    sort_by: TemplateSortBy = TemplateSortBy.CREATED_AT
    sort_order: TemplateSortOrder = TemplateSortOrder.DESC
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)


class UpdateTemplateVersionRequest(BaseModel):
    """Request to update template version"""
    version: str = Field(..., min_length=1)
    changelog: Optional[str] = None


# Response Models
class TemplateResponse(BaseModel):
    """Basic template response"""
    id: str
    name: str
    slug: str
    status: TemplateStatus
    visibility: TemplateVisibility
    metadata: TemplateMetadata
    version_info: TemplateVersion
    metrics: TemplateMetrics
    created_by: Optional[str]
    organization_id: Optional[str]
    featured: bool
    verified: bool
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]
    
    class Config:
        from_attributes = True
    
    @classmethod
    def from_template(cls, template) -> "TemplateResponse":
        """Convert Template model to response"""
        return cls(
            id=str(template.id),
            name=template.name,
            slug=template.slug,
            status=template.status,
            visibility=template.visibility,
            metadata=template.metadata,
            version_info=template.version_info,
            metrics=template.metrics,
            created_by=template.created_by,
            organization_id=template.organization_id,
            featured=template.featured,
            verified=template.verified,
            created_at=template.created_at,
            updated_at=template.updated_at,
            published_at=template.published_at
        )


class TemplateDetailResponse(TemplateResponse):
    """Detailed template response with workflow content"""
    nodes: List[Node]
    edges: List[Edge]
    variables: List[WorkflowVariable]
    ratings: List[TemplateRating]
    parent_template_id: Optional[str]
    collaborators: List[str]
    
    @classmethod
    def from_template(cls, template) -> "TemplateDetailResponse":
        """Convert Template model to detailed response"""
        return cls(
            id=str(template.id),
            name=template.name,
            slug=template.slug,
            status=template.status,
            visibility=template.visibility,
            metadata=template.metadata,
            version_info=template.version_info,
            metrics=template.metrics,
            created_by=template.created_by,
            organization_id=template.organization_id,
            featured=template.featured,
            verified=template.verified,
            created_at=template.created_at,
            updated_at=template.updated_at,
            published_at=template.published_at,
            nodes=template.nodes,
            edges=template.edges,
            variables=template.variables,
            ratings=template.ratings,
            parent_template_id=str(template.parent_template_id) if template.parent_template_id else None,
            collaborators=template.collaborators
        )


class TemplateSummaryResponse(BaseModel):
    """Summary template response for lists"""
    id: str
    name: str
    slug: str
    status: TemplateStatus
    metadata: TemplateMetadata
    metrics: TemplateMetrics
    featured: bool
    verified: bool
    created_at: datetime
    
    @classmethod
    def from_template(cls, template) -> "TemplateSummaryResponse":
        """Convert Template model to summary response"""
        return cls(
            id=str(template.id),
            name=template.name,
            slug=template.slug,
            status=template.status,
            metadata=template.metadata,
            metrics=template.metrics,
            featured=template.featured,
            verified=template.verified,
            created_at=template.created_at
        )


class TemplateSearchResponse(BaseModel):
    """Response for template search with pagination"""
    templates: List[TemplateSummaryResponse]
    pagination: Dict[str, Any]
    filters_applied: Optional[Dict[str, Any]]
    sort: Dict[str, Any]


class TemplateCategoryResponse(BaseModel):
    """Template category with count"""
    name: str
    display_name: str
    count: int


class TemplateTagResponse(BaseModel):
    """Popular template tag with count"""
    name: str
    count: int


class TemplateAnalyticsResponse(BaseModel):
    """Template analytics data"""
    template_id: str
    basic_metrics: Dict[str, Any]
    engagement: Dict[str, Any]
    metadata: Dict[str, Any]
    timeline: Dict[str, Any]


class TemplateValidationResponse(BaseModel):
    """Template validation result"""
    is_valid: bool
    errors: List[Dict[str, Any]]
    warnings: List[Dict[str, Any]]
    info: List[Dict[str, Any]]


class TemplateOperationResponse(BaseModel):
    """Generic response for template operations"""
    success: bool
    message: str
    template_id: Optional[str] = None
    workflow_id: Optional[str] = None  # For deployment operations


class TemplateStatsResponse(BaseModel):
    """Overall template statistics"""
    total_templates: int
    published_templates: int
    featured_templates: int
    categories: List[TemplateCategoryResponse]
    popular_tags: List[TemplateTagResponse]
    top_rated: List[TemplateSummaryResponse]
    most_downloaded: List[TemplateSummaryResponse]


# Utility Models
class PaginationInfo(BaseModel):
    """Pagination information"""
    page: int
    page_size: int
    total_count: int
    total_pages: int
    has_next: bool
    has_prev: bool


class TemplateListResponse(BaseModel):
    """Generic paginated template list response"""
    templates: List[TemplateSummaryResponse]
    pagination: PaginationInfo


class BulkTemplateOperation(BaseModel):
    """Request for bulk operations on templates"""
    template_ids: List[str]
    operation: str  # "publish", "unpublish", "delete", "feature", "unfeature"


class BulkOperationResponse(BaseModel):
    """Response for bulk operations"""
    success_count: int
    failure_count: int
    results: List[Dict[str, Any]]


# Export models for easy import
__all__ = [
    "CreateTemplateRequest",
    "UpdateTemplateRequest", 
    "CreateTemplateFromWorkflowRequest",
    "DeployTemplateRequest",
    "CloneTemplateRequest",
    "AddTemplateRatingRequest",
    "TemplateSearchRequest",
    "UpdateTemplateVersionRequest",
    "TemplateResponse",
    "TemplateDetailResponse",
    "TemplateSummaryResponse",
    "TemplateSearchResponse",
    "TemplateCategoryResponse",
    "TemplateTagResponse",
    "TemplateAnalyticsResponse",
    "TemplateValidationResponse",
    "TemplateOperationResponse",
    "TemplateStatsResponse",
    "PaginationInfo",
    "TemplateListResponse",
    "BulkTemplateOperation",
    "BulkOperationResponse"
]