from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    azure_openai_endpoint: str
    azure_openai_api_version: str
    azure_openai_chat_deployment_name: str
    azure_openai_embedding_deployment_name: str
    azure_subscription_id: str
    azure_resource_group: str
    azure_apim_service_name: str
    azure_apim_service_api_version: str
    azure_apim_service_product_id: str
    azure_apim_service_subscription_key: str


@lru_cache
def get_settings():
    return Settings()


__all__ = ["get_settings"]
