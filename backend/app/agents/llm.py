"""LLM client factory for the agents — OpenAI or AWS Bedrock, via LangChain.

Both providers return a LangChain chat model, so the agents keep using
`.with_structured_output(...)` and vision messages unchanged.
"""

import os

from app.config import get_settings

settings = get_settings()


def get_chat_llm(temperature: float = 0.3):
    provider = (settings.llm_provider or "openai").lower()

    if provider == "bedrock":
        from langchain_aws import ChatBedrockConverse

        # New-style Bedrock API keys authenticate via this env var (bearer token),
        # so no AWS access-key/secret pair is required.
        if settings.aws_bedrock_api_key:
            os.environ.setdefault("AWS_BEARER_TOKEN_BEDROCK", settings.aws_bedrock_api_key)
        region = settings.bedrock_region or settings.aws_region
        return ChatBedrockConverse(
            model=settings.bedrock_model_id,
            region_name=region,
            temperature=temperature,
            max_tokens=4096,
        )

    from langchain_openai import ChatOpenAI

    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY not configured")
    return ChatOpenAI(
        model=settings.openai_chat_model,
        api_key=settings.openai_api_key,
        temperature=temperature,
        timeout=60,
        max_retries=2,
    )
