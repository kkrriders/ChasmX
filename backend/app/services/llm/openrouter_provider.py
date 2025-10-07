"""
OpenRouter Provider implementation.
Connects to various models (GPT-4, Claude, Gemini, Llama, Qwen) via OpenRouter API.
"""
import asyncio
import time
from typing import Optional, Dict, Any, AsyncIterator
import aiohttp
from loguru import logger

from .base import (
    LLMProvider,
    LLMRequest,
    LLMResponse,
    LLMMessage,
    LLMUsage,
    ModelConfig,
    ModelRole
)


class OpenRouterProvider(LLMProvider):
    """OpenRouter API provider for multiple LLM models"""

    BASE_URL = "https://openrouter.ai/api/v1"

    # Default model configurations based on your specification
    DEFAULT_MODELS = {
        "google/gemini-2.0-flash-exp:free": ModelConfig(
            model_id="google/gemini-2.0-flash-exp:free",
            name="Google Gemini 2.0 Flash",
            role=ModelRole.COMMUNICATION,
            max_tokens=8192,
            temperature=0.7,
            context_length=1000000,
            description="Fastest, 1M context, best for real-time agent interactions and function calling"
        ),
        "meta-llama/llama-3.3-70b-instruct:free": ModelConfig(
            model_id="meta-llama/llama-3.3-70b-instruct:free",
            name="Meta Llama 3.3 70B",
            role=ModelRole.REASONING,
            max_tokens=4096,
            temperature=0.8,
            context_length=128000,
            description="Most powerful, best for workflow orchestration and complex reasoning"
        ),
        "qwen/qwen-2.5-coder-32b-instruct:free": ModelConfig(
            model_id="qwen/qwen-2.5-coder-32b-instruct:free",
            name="Qwen2.5 Coder 32B",
            role=ModelRole.CODE,
            max_tokens=4096,
            temperature=0.3,
            context_length=32768,
            description="Specialized for code generation, debugging, and analysis"
        ),
        "qwen/qwen-2.5-72b-instruct:free": ModelConfig(
            model_id="qwen/qwen-2.5-72b-instruct:free",
            name="Qwen2.5 72B Instruct",
            role=ModelRole.STRUCTURED,
            max_tokens=4096,
            temperature=0.5,
            context_length=32768,
            description="Best for structured outputs, JSON generation, and agent-to-agent data exchange"
        )
    }

    def __init__(
        self,
        api_key: str,
        config: Optional[Dict[str, ModelConfig]] = None,
        timeout: int = 120,
        max_retries: int = 3
    ):
        """
        Initialize OpenRouter provider.

        Args:
            api_key: OpenRouter API key
            config: Custom model configurations (uses defaults if not provided)
            timeout: Request timeout in seconds
            max_retries: Maximum number of retry attempts
        """
        super().__init__(api_key, config or self.DEFAULT_MODELS.copy())
        self.timeout = timeout
        self.max_retries = max_retries
        self.session: Optional[aiohttp.ClientSession] = None

    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=self.timeout)
            )
        return self.session

    async def close(self):
        """Close the aiohttp session"""
        if self.session and not self.session.closed:
            await self.session.close()

    def _prepare_headers(self, request: LLMRequest) -> Dict[str, str]:
        """Prepare headers for OpenRouter API request"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://chasmx.ai",  # Optional: your site
            "X-Title": "ChasmX Agent System"  # Optional: your app name
        }
        return headers

    def _prepare_payload(self, request: LLMRequest) -> Dict[str, Any]:
        """Convert LLMRequest to OpenRouter API payload"""
        # Convert messages to OpenAI format
        messages = []
        for msg in request.messages:
            message_dict = {
                "role": msg.role,
                "content": msg.content
            }
            if msg.name:
                message_dict["name"] = msg.name
            if msg.function_call:
                message_dict["function_call"] = msg.function_call
            messages.append(message_dict)

        payload = {
            "model": request.model_id,
            "messages": messages,
        }

        # Add optional parameters
        if request.temperature is not None:
            payload["temperature"] = request.temperature
        if request.max_tokens is not None:
            payload["max_tokens"] = request.max_tokens
        if request.top_p is not None:
            payload["top_p"] = request.top_p
        if request.frequency_penalty is not None:
            payload["frequency_penalty"] = request.frequency_penalty
        if request.presence_penalty is not None:
            payload["presence_penalty"] = request.presence_penalty
        if request.stop:
            payload["stop"] = request.stop
        if request.functions:
            payload["functions"] = request.functions
        if request.function_call:
            payload["function_call"] = request.function_call
        if request.stream:
            payload["stream"] = request.stream

        return payload

    def _parse_response(
        self,
        response_data: Dict[str, Any],
        model_id: str,
        latency_ms: float
    ) -> LLMResponse:
        """Parse OpenRouter API response to LLMResponse"""
        choice = response_data.get("choices", [{}])[0]
        message = choice.get("message", {})

        usage_data = response_data.get("usage", {})
        usage = LLMUsage(
            prompt_tokens=usage_data.get("prompt_tokens", 0),
            completion_tokens=usage_data.get("completion_tokens", 0),
            total_tokens=usage_data.get("total_tokens", 0)
        )

        return LLMResponse(
            content=message.get("content", ""),
            model_id=model_id,
            finish_reason=choice.get("finish_reason"),
            usage=usage,
            function_call=message.get("function_call"),
            cached=False,
            latency_ms=latency_ms,
            metadata=response_data
        )

    async def complete(self, request: LLMRequest) -> LLMResponse:
        """
        Generate a completion using OpenRouter API.

        Args:
            request: LLM request with messages and parameters

        Returns:
            LLM response with generated content

        Raises:
            Exception: If API request fails after retries
        """
        session = await self._get_session()
        headers = self._prepare_headers(request)
        payload = self._prepare_payload(request)

        start_time = time.time()
        last_error = None

        for attempt in range(self.max_retries):
            try:
                async with session.post(
                    f"{self.BASE_URL}/chat/completions",
                    headers=headers,
                    json=payload
                ) as response:
                    latency_ms = (time.time() - start_time) * 1000

                    if response.status == 200:
                        data = await response.json()
                        logger.info(
                            f"OpenRouter API success: model={request.model_id}, "
                            f"latency={latency_ms:.2f}ms, attempt={attempt + 1}"
                        )
                        return self._parse_response(data, request.model_id, latency_ms)
                    else:
                        error_text = await response.text()
                        last_error = f"HTTP {response.status}: {error_text}"
                        logger.warning(
                            f"OpenRouter API error (attempt {attempt + 1}/{self.max_retries}): "
                            f"{last_error}"
                        )

                        # Don't retry on client errors (4xx)
                        if 400 <= response.status < 500:
                            break

            except asyncio.TimeoutError:
                last_error = "Request timeout"
                logger.warning(
                    f"OpenRouter API timeout (attempt {attempt + 1}/{self.max_retries})"
                )
            except Exception as e:
                last_error = str(e)
                logger.warning(
                    f"OpenRouter API exception (attempt {attempt + 1}/{self.max_retries}): {e}"
                )

            # Exponential backoff
            if attempt < self.max_retries - 1:
                await asyncio.sleep(2 ** attempt)

        error_msg = f"Failed to complete request after {self.max_retries} attempts: {last_error}"
        logger.error(error_msg)
        raise Exception(error_msg)

    async def stream_complete(self, request: LLMRequest) -> AsyncIterator[str]:
        """
        Stream a completion using OpenRouter API.

        Args:
            request: LLM request with messages and parameters

        Yields:
            Content chunks from the streaming response
        """
        session = await self._get_session()
        headers = self._prepare_headers(request)

        # Ensure streaming is enabled
        payload = self._prepare_payload(request)
        payload["stream"] = True

        try:
            async with session.post(
                f"{self.BASE_URL}/chat/completions",
                headers=headers,
                json=payload
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise Exception(f"HTTP {response.status}: {error_text}")

                async for line in response.content:
                    line = line.decode('utf-8').strip()
                    if line.startswith("data: "):
                        data = line[6:]  # Remove "data: " prefix
                        if data == "[DONE]":
                            break

                        try:
                            import json
                            chunk = json.loads(data)
                            delta = chunk.get("choices", [{}])[0].get("delta", {})
                            content = delta.get("content", "")
                            if content:
                                yield content
                        except json.JSONDecodeError:
                            continue

        except Exception as e:
            logger.error(f"Streaming error: {e}")
            raise

    def get_recommended_model(self, role: ModelRole) -> Optional[ModelConfig]:
        """Get the recommended model for a specific role"""
        models = self.get_models_by_role(role)
        return models[0] if models else None
