import logging
import httpx
from opentelemetry import trace
from azure.identity import DefaultAzureCredential
from app.config import get_settings

logger = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)

azure_apim_base_url = f"{get_settings().azure_apim_endpoint}/docs"
azure_apim_service_subscription_key = get_settings().azure_apim_apichat_subscription_key

# Function to get the access token
@tracer.start_as_current_span(name="chat")
async def get_access_token():
    credential = DefaultAzureCredential()
    token = await credential.get_token("https://management.azure.com/.default")
    return token.token

# Function to fetch APIs that belong to a certain product
@tracer.start_as_current_span(name="fetch_apis_by_product")
async def fetch_apis_by_product(product_id, access_token=None):
    headers = {
        'Content-Type': 'application/json'
    }
    if access_token:
        headers['Authorization'] = f'Bearer {access_token}'
    if azure_apim_service_subscription_key:
        headers['Ocp-Apim-Subscription-Key'] = azure_apim_service_subscription_key

    url = f'{azure_apim_base_url}/products/{product_id}/apis?api-version={get_settings().azure_apim_service_api_version}'
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        return response.json()['value']

# Get the OpenAPI JSON file from the export endpoint
@tracer.start_as_current_span(name="fetch_openapi_spec")
async def fetch_openapi_spec(api_id, access_token=None):
    headers = {
        'Content-Type': 'application/json'
    }
    if access_token:
        headers['Authorization'] = f'Bearer {access_token}'
    if azure_apim_service_subscription_key:
        headers['Ocp-Apim-Subscription-Key'] = azure_apim_service_subscription_key

    url = f'{azure_apim_base_url}/apis/{api_id}?export=true&format=openapi&api-version={get_settings().azure_apim_service_api_version}'
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        return response.text

# Function to fetch named values
@tracer.start_as_current_span(name="fetch_named_value")
async def fetch_named_value(named_value_id, access_token=None):
    headers = {
        'Content-Type': 'application/json'
    }
    if access_token:
        headers['Authorization'] = f'Bearer {access_token}'
    if azure_apim_service_subscription_key:
        headers['Ocp-Apim-Subscription-Key'] = azure_apim_service_subscription_key

    url = f'{azure_apim_base_url}/namedValues/{named_value_id}?api-version={get_settings().azure_apim_service_api_version}'
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        return response.json()['properties']['value']

@tracer.start_as_current_span(name="fetch_products_name_contains")
async def fetch_products_name_contains(name_contains_value, access_token=None):
    headers = {
        'Content-Type': 'application/json'
    }
    if access_token:
        headers['Authorization'] = f'Bearer {access_token}'
    if azure_apim_service_subscription_key:
        headers['Ocp-Apim-Subscription-Key'] = azure_apim_service_subscription_key

    url = f'{azure_apim_base_url}/products?api-version={get_settings().azure_apim_service_api_version}&$filter=contains(name,\'{name_contains_value}\') and state eq \'published\''
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        return response.json()['value']

__all__ = ["get_access_token", "fetch_apis_by_product", "fetch_openapi_spec", "fetch_named_value", "fetch_products_name_contains"]
