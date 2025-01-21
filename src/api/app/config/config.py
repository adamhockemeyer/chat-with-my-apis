from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    azure_openai_api_version: str
    azure_openai_chat_deployment_name: str
    azure_openai_api_key: str
    azure_apim_service_api_version: str
    azure_apim_service_product_id: str
    azure_apim_service_subscription_key: str
    azure_apim_endpoint: str
    azure_apim_apichat_subscription_key: str
    azure_openai_endpoint: str


@lru_cache
def get_settings():
    return Settings()


__all__ = ["get_settings"]
