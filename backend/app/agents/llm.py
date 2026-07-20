"""LLM client factory for the agents (OpenAI via LangChain)."""

from langchain_openai import ChatOpenAI

from app.config import get_settings

settings = get_settings()


def get_chat_llm(temperature: float = 0.3) -> ChatOpenAI:
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY not configured")
    return ChatOpenAI(
        model=settings.openai_chat_model,
        api_key=settings.openai_api_key,
        temperature=temperature,
        timeout=60,
        max_retries=2,
    )
