from enum import Enum
from typing import List, Dict, Any, Optional
from datetime import datetime
from beanie import Document
from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId

from .workflow import Node, Edge, WorkflowVariable, Metadata as WorkflowMetadata

# Template-specific Enums
class TemplateStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"
    DEPRECATED = "deprecated"

class TemplateComplexity(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class TemplateCategory(str, Enum):
    AUTOMATION = "automation"
    DATA_PROCESSING = "data_processing"
    AI_ML = "ai_ml"
    INTEGRATION = "integration"
    ANALYTICS = "analytics"
    SALES = "sales"
    MARKETING = "marketing"
    FINANCE = "finance"
    HR = "hr"
    OPERATIONS = "operations"
    CUSTOM = "custom"

class TemplateVisibility(str, Enum):
    PUBLIC = "public"
    PRIVATE = "private"
    ORGANIZATION = "organization"

# Template Metadata Models
class TemplateRating(BaseModel):
    """User rating for a template"""
    user_id: str
    rating: int = Field(..., ge=1, le=5)
    review: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TemplateMetrics(BaseModel):
    """Template usage and performance metrics"""
    download_count: int = 0
    deployment_count: int = 0
    success_rate: float = 0.0  # Percentage of successful deployments
    average_rating: float = 0.0
    total_ratings: int = 0
    last_used: Optional[datetime] = None

class TemplateVersion(BaseModel):
    """Template version information"""
    version: str = "1.0.0"
    changelog: Optional[str] = None
    is_latest: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None

class TemplateRequirements(BaseModel):
    """Template requirements and dependencies"""
    required_integrations: List[str] = []  # Required external services
    required_credentials: List[str] = []   # Required credential types
    estimated_execution_time: Optional[str] = None  # e.g., "5-10 minutes"
    cost_estimate: Optional[str] = None    # e.g., "Low", "$0.01-$0.10 per run"

class TemplateMetadata(BaseModel):
    """Extended metadata for templates"""
    description: str
    short_description: Optional[str] = None
    category: TemplateCategory
    tags: List[str] = []
    complexity: TemplateComplexity = TemplateComplexity.BEGINNER
    author: Optional[str] = None
    author_email: Optional[str] = None
    organization: Optional[str] = None
    icon: Optional[str] = None  # Icon URL or identifier
    preview_image: Optional[str] = None  # Preview image URL
    documentation_url: Optional[str] = None
    video_url: Optional[str] = None
    use_cases: List[str] = []  # List of use cases this template addresses
    industries: List[str] = []  # Target industries
    requirements: TemplateRequirements = Field(default_factory=TemplateRequirements)

# Main Template Document
class Template(Document):
    """Template document model with comprehensive metadata and versioning"""
    
    # Basic Information
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)  # URL-friendly identifier
    
    # Template Content
    nodes: List[Node]
    edges: List[Edge]
    variables: List[WorkflowVariable] = []
    
    # Template-specific metadata
    metadata: TemplateMetadata
    
    # Status and visibility
    status: TemplateStatus = TemplateStatus.DRAFT
    visibility: TemplateVisibility = TemplateVisibility.PRIVATE
    
    # Versioning
    version_info: TemplateVersion = Field(default_factory=TemplateVersion)
    parent_template_id: Optional[str] = None  # For template forks/variations
    
    # Metrics and engagement
    metrics: TemplateMetrics = Field(default_factory=TemplateMetrics)
    ratings: List[TemplateRating] = []
    
    # Ownership and permissions
    created_by: Optional[str] = None  # User ID
    organization_id: Optional[str] = None  # Organization ID for multi-tenancy
    collaborators: List[str] = []  # List of user IDs with edit access
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    published_at: Optional[datetime] = None
    
    # Search and discovery
    featured: bool = False  # Admin-curated featured templates
    verified: bool = False  # Official/verified templates
    
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    class Settings:
        name = "templates"
        indexes = [
            "name",
            "slug",
            "metadata.category",
            "metadata.tags",
            "status",
            "visibility",
            "created_by",
            "organization_id",
            "featured",
            "verified",
            ("metadata.category", "status"),
            ("visibility", "status"),
            ("metrics.average_rating", -1),  # Descending order
            ("metrics.download_count", -1),  # Descending order
            ("created_at", -1),  # Descending order
        ]
    
    def update_metrics(self):
        """Update calculated metrics based on ratings"""
        if self.ratings:
            total_rating = sum(r.rating for r in self.ratings)
            self.metrics.average_rating = total_rating / len(self.ratings)
            self.metrics.total_ratings = len(self.ratings)
        else:
            self.metrics.average_rating = 0.0
            self.metrics.total_ratings = 0
    
    def add_rating(self, user_id: str, rating: int, review: Optional[str] = None):
        """Add or update a user's rating for this template"""
        # Remove existing rating from same user
        self.ratings = [r for r in self.ratings if r.user_id != user_id]
        
        # Add new rating
        new_rating = TemplateRating(
            user_id=user_id,
            rating=rating,
            review=review
        )
        self.ratings.append(new_rating)
        
        # Update metrics
        self.update_metrics()
        self.updated_at = datetime.utcnow()
    
    def increment_download_count(self):
        """Increment download/usage counter"""
        self.metrics.download_count += 1
        self.metrics.last_used = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def increment_deployment_count(self, success: bool = True):
        """Increment deployment counter and update success rate"""
        self.metrics.deployment_count += 1
        
        # Recalculate success rate (simple approach)
        if success:
            current_successful = self.metrics.success_rate * (self.metrics.deployment_count - 1) / 100
            new_successful = current_successful + 1
            self.metrics.success_rate = (new_successful / self.metrics.deployment_count) * 100
        else:
            current_successful = self.metrics.success_rate * (self.metrics.deployment_count - 1) / 100
            self.metrics.success_rate = (current_successful / self.metrics.deployment_count) * 100
        
        self.metrics.last_used = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def to_workflow_dict(self) -> Dict[str, Any]:
        """Convert template to workflow format for deployment"""
        return {
            "name": f"{self.name} (from template)",
            "nodes": [node.model_dump() for node in self.nodes],
            "edges": [edge.model_dump() for edge in self.edges],
            "variables": [var.model_dump() for var in self.variables],
            "metadata": WorkflowMetadata(
                description=self.metadata.description,
                tags=self.metadata.tags + [f"template:{self.slug}"],
                author=self.metadata.author,
                version=self.version_info.version
            ).model_dump()
        }

# Template Search and Filtering Models
class TemplateFilter(BaseModel):
    """Filter criteria for template search"""
    category: Optional[TemplateCategory] = None
    tags: Optional[List[str]] = None
    complexity: Optional[TemplateComplexity] = None
    author: Optional[str] = None
    organization_id: Optional[str] = None
    featured_only: bool = False
    verified_only: bool = False
    min_rating: Optional[float] = None
    search_query: Optional[str] = None  # Search in name, description, tags

class TemplateSortBy(str, Enum):
    NAME = "name"
    CREATED_AT = "created_at"
    UPDATED_AT = "updated_at"
    DOWNLOAD_COUNT = "download_count"
    RATING = "rating"
    POPULARITY = "popularity"  # Combined metric

class TemplateSortOrder(str, Enum):
    ASC = "asc"
    DESC = "desc"