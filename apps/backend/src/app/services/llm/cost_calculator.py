"""
Cost Calculator for LLM Usage.
Calculates costs based on token usage and model pricing.
"""
from typing import Dict, Optional
from pydantic import BaseModel, Field
from loguru import logger


class ModelPricing(BaseModel):
    """Pricing information for a model"""
    model_id: str
    input_cost_per_1m: float = Field(description="Cost per 1M input tokens in USD")
    output_cost_per_1m: float = Field(description="Cost per 1M output tokens in USD")
    currency: str = Field(default="USD")


class CostCalculator:
    """
    Calculate costs for LLM usage based on token counts and model pricing.

    Pricing data is based on OpenRouter's pricing as of January 2025.
    Free models have $0 cost but we track usage for analytics.
    """

    # OpenRouter Free Model Pricing (January 2025)
    # Note: These are free models, but we track "equivalent value" for analytics
    DEFAULT_PRICING: Dict[str, ModelPricing] = {
        # Free models - no actual cost
        "google/gemini-2.0-flash-exp:free": ModelPricing(
            model_id="google/gemini-2.0-flash-exp:free",
            input_cost_per_1m=0.0,  # Free
            output_cost_per_1m=0.0   # Free
        ),
        "meta-llama/llama-3.3-70b-instruct:free": ModelPricing(
            model_id="meta-llama/llama-3.3-70b-instruct:free",
            input_cost_per_1m=0.0,  # Free
            output_cost_per_1m=0.0   # Free
        ),
        "qwen/qwen-2.5-coder-32b-instruct:free": ModelPricing(
            model_id="qwen/qwen-2.5-coder-32b-instruct:free",
            input_cost_per_1m=0.0,  # Free
            output_cost_per_1m=0.0   # Free
        ),
        "qwen/qwen-2.5-72b-instruct:free": ModelPricing(
            model_id="qwen/qwen-2.5-72b-instruct:free",
            input_cost_per_1m=0.0,  # Free
            output_cost_per_1m=0.0   # Free
        ),

        # Paid models (for reference/future use)
        "anthropic/claude-3.5-sonnet": ModelPricing(
            model_id="anthropic/claude-3.5-sonnet",
            input_cost_per_1m=3.00,
            output_cost_per_1m=15.00
        ),
        "anthropic/claude-3-haiku": ModelPricing(
            model_id="anthropic/claude-3-haiku",
            input_cost_per_1m=0.25,
            output_cost_per_1m=1.25
        ),
        "openai/gpt-4o": ModelPricing(
            model_id="openai/gpt-4o",
            input_cost_per_1m=2.50,
            output_cost_per_1m=10.00
        ),
        "openai/gpt-4o-mini": ModelPricing(
            model_id="openai/gpt-4o-mini",
            input_cost_per_1m=0.15,
            output_cost_per_1m=0.60
        ),
        "google/gemini-pro-1.5": ModelPricing(
            model_id="google/gemini-pro-1.5",
            input_cost_per_1m=1.25,
            output_cost_per_1m=5.00
        ),
        "meta-llama/llama-3.3-70b-instruct": ModelPricing(
            model_id="meta-llama/llama-3.3-70b-instruct",
            input_cost_per_1m=0.59,
            output_cost_per_1m=0.79
        ),
        "deepseek/deepseek-coder": ModelPricing(
            model_id="deepseek/deepseek-coder",
            input_cost_per_1m=0.14,
            output_cost_per_1m=0.28
        ),

        # Embedding models
        "openai/text-embedding-3-small": ModelPricing(
            model_id="openai/text-embedding-3-small",
            input_cost_per_1m=0.02,
            output_cost_per_1m=0.0  # Embeddings only have input cost
        ),
        "openai/text-embedding-3-large": ModelPricing(
            model_id="openai/text-embedding-3-large",
            input_cost_per_1m=0.13,
            output_cost_per_1m=0.0
        ),
        "openai/text-embedding-ada-002": ModelPricing(
            model_id="openai/text-embedding-ada-002",
            input_cost_per_1m=0.10,
            output_cost_per_1m=0.0
        )
    }

    def __init__(self, custom_pricing: Optional[Dict[str, ModelPricing]] = None):
        """
        Initialize cost calculator.

        Args:
            custom_pricing: Optional custom pricing to override defaults
        """
        self.pricing = self.DEFAULT_PRICING.copy()
        if custom_pricing:
            self.pricing.update(custom_pricing)

    def get_model_pricing(self, model_id: str) -> Optional[ModelPricing]:
        """
        Get pricing for a specific model.

        Args:
            model_id: Model identifier

        Returns:
            ModelPricing or None if not found
        """
        return self.pricing.get(model_id)

    def calculate_cost(
        self,
        model_id: str,
        input_tokens: int,
        output_tokens: int
    ) -> float:
        """
        Calculate cost for LLM usage.

        Args:
            model_id: Model identifier
            input_tokens: Number of input/prompt tokens
            output_tokens: Number of output/completion tokens

        Returns:
            Total cost in USD
        """
        pricing = self.get_model_pricing(model_id)

        if not pricing:
            logger.warning(f"No pricing found for model: {model_id}, assuming $0")
            return 0.0

        # Calculate cost per token type
        input_cost = (input_tokens / 1_000_000) * pricing.input_cost_per_1m
        output_cost = (output_tokens / 1_000_000) * pricing.output_cost_per_1m

        total_cost = input_cost + output_cost

        logger.debug(
            f"Cost calculation: model={model_id}, "
            f"input_tokens={input_tokens}, output_tokens={output_tokens}, "
            f"input_cost=${input_cost:.6f}, output_cost=${output_cost:.6f}, "
            f"total=${total_cost:.6f}"
        )

        return total_cost

    def calculate_embedding_cost(
        self,
        model_id: str,
        tokens: int
    ) -> float:
        """
        Calculate cost for embedding generation.

        Args:
            model_id: Embedding model identifier
            tokens: Number of tokens in input text

        Returns:
            Cost in USD
        """
        pricing = self.get_model_pricing(model_id)

        if not pricing:
            logger.warning(f"No pricing found for embedding model: {model_id}, assuming $0")
            return 0.0

        cost = (tokens / 1_000_000) * pricing.input_cost_per_1m

        logger.debug(
            f"Embedding cost: model={model_id}, tokens={tokens}, cost=${cost:.6f}"
        )

        return cost

    def estimate_tokens_from_text(self, text: str) -> int:
        """
        Estimate token count from text (rough approximation).

        Uses a simple heuristic: ~4 characters per token on average.
        For precise counting, use tiktoken or the model's tokenizer.

        Args:
            text: Input text

        Returns:
            Estimated token count
        """
        # Simple approximation: 1 token ≈ 4 characters
        estimated_tokens = len(text) // 4
        return max(estimated_tokens, 1)  # At least 1 token

    def add_custom_model_pricing(
        self,
        model_id: str,
        input_cost_per_1m: float,
        output_cost_per_1m: float
    ):
        """
        Add or update pricing for a custom model.

        Args:
            model_id: Model identifier
            input_cost_per_1m: Cost per 1M input tokens
            output_cost_per_1m: Cost per 1M output tokens
        """
        self.pricing[model_id] = ModelPricing(
            model_id=model_id,
            input_cost_per_1m=input_cost_per_1m,
            output_cost_per_1m=output_cost_per_1m
        )
        logger.info(
            f"Added custom pricing for {model_id}: "
            f"input=${input_cost_per_1m}/1M, output=${output_cost_per_1m}/1M"
        )

    def get_all_pricing(self) -> Dict[str, ModelPricing]:
        """
        Get all model pricing information.

        Returns:
            Dictionary of model_id -> ModelPricing
        """
        return self.pricing.copy()

    def compare_costs(
        self,
        input_tokens: int,
        output_tokens: int,
        models: Optional[list] = None
    ) -> Dict[str, float]:
        """
        Compare costs across multiple models.

        Args:
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens
            models: List of model IDs to compare (or None for all)

        Returns:
            Dictionary of model_id -> cost
        """
        models_to_compare = models or list(self.pricing.keys())

        costs = {}
        for model_id in models_to_compare:
            cost = self.calculate_cost(model_id, input_tokens, output_tokens)
            costs[model_id] = cost

        # Sort by cost (cheapest first)
        sorted_costs = dict(sorted(costs.items(), key=lambda x: x[1]))

        logger.info(
            f"Cost comparison for {input_tokens} input + {output_tokens} output tokens:"
        )
        for model_id, cost in sorted_costs.items():
            logger.info(f"  {model_id}: ${cost:.6f}")

        return sorted_costs


# Global cost calculator instance
cost_calculator = CostCalculator()
