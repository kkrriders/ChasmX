"""
Base interfaces and abstractions for LLM Service.
Provides a unified interface for interacting with different LLM providers.
"""
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from enum import Enum


class ModelRole(str, Enum):
    """Different roles models can serve in the agent system"""
    COMMUNICATION = "communication"  # Agent-to-agent, function calling
    REASONING = "reasoning"  # Complex decisions, orchestration
    CODE = "code"  # Code generation and analysis
    STRUCTURED = "structured"  # JSON generation, data exchange


class ModelConfig(BaseModel):
    """Configuration for a specific model"""
    model_id: str = Field(..., description="Model identifier (e.g., google/gemini-2.0-flash-exp:free)")
    name: str = Field(..., description="Friendly name for the model")
    role: ModelRole = Field(..., description="Primary role this model serves")
    max_tokens: int = Field(default=2048, description="Maximum tokens in response")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0, description="Sampling temperature")
    context_length: int = Field(default=8192, description="Maximum context window")
    description: Optional[str] = Field(None, description="Model capabilities description")

    class Config:
        use_enum_values = True


class LLMMessage(BaseModel):
    """Represents a message in the conversation"""
    role: str = Field(..., description="Role: system, user, assistant, or function")
    content: str = Field(..., description="Message content")
    name: Optional[str] = Field(None, description="Name of the function or agent")
    function_call: Optional[Dict[str, Any]] = Field(None, description="Function call details")


class LLMRequest(BaseModel):
    """Request to an LLM provider"""
    messages: List[LLMMessage] = Field(..., description="Conversation messages")
    model_id: str = Field(..., description="Model to use")
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(None, gt=0)
    top_p: Optional[float] = Field(None, ge=0.0, le=1.0)
    frequency_penalty: Optional[float] = Field(None, ge=-2.0, le=2.0)
    presence_penalty: Optional[float] = Field(None, ge=-2.0, le=2.0)
    stop: Optional[List[str]] = Field(None, description="Stop sequences")
    functions: Optional[List[Dict[str, Any]]] = Field(None, description="Available functions")
    function_call: Optional[str] = Field(None, description="Control function calling")
    stream: bool = Field(default=False, description="Enable streaming responses")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")

    # Caching options
    use_cache: bool = Field(default=True, description="Whether to use cached responses")
    cache_ttl: Optional[int] = Field(default=3600, description="Cache TTL in seconds")


class LLMUsage(BaseModel):
    """Token usage information"""
    prompt_tokens: int = Field(default=0)
    completion_tokens: int = Field(default=0)
    total_tokens: int = Field(default=0)
    cost_usd: Optional[float] = Field(None, description="Estimated cost in USD")


class LLMResponse(BaseModel):
    """Response from an LLM provider"""
    content: str = Field(..., description="Generated content")
    model_id: str = Field(..., description="Model that generated the response")
    finish_reason: Optional[str] = Field(None, description="Why generation stopped")
    usage: Optional[LLMUsage] = Field(None, description="Token usage statistics")
    function_call: Optional[Dict[str, Any]] = Field(None, description="Function call if requested")
    cached: bool = Field(default=False, description="Whether response was from cache")
    latency_ms: Optional[float] = Field(None, description="Response latency in milliseconds")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class LLMProvider(ABC):
    """Abstract base class for LLM providers"""

    def __init__(self, api_key: str, config: Optional[Dict[str, ModelConfig]] = None):
        """
        Initialize the provider.

        Args:
            api_key: API key for the provider
            config: Dictionary of model configurations
        """
        self.api_key = api_key
        self.model_configs = config or {}

    @abstractmethod
    async def complete(self, request: LLMRequest) -> LLMResponse:
        """
        Generate a completion for the given request.

        Args:
            request: LLM request with messages and parameters

        Returns:
            LLM response with generated content
        """
        pass

    @abstractmethod
    async def stream_complete(self, request: LLMRequest):
        """
        Stream a completion for the given request.

        Args:
            request: LLM request with messages and parameters

        Yields:
            Chunks of the LLM response
        """
        pass

    def get_model_config(self, model_id: str) -> Optional[ModelConfig]:
        """Get configuration for a specific model"""
        return self.model_configs.get(model_id)

    def register_model(self, config: ModelConfig) -> None:
        """Register a new model configuration"""
        self.model_configs[config.model_id] = config

    def get_models_by_role(self, role: ModelRole) -> List[ModelConfig]:
        """Get all models that serve a specific role"""
        return [
            config for config in self.model_configs.values()
            if config.role == role
        ]
