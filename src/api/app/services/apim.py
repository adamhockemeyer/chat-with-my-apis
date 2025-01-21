import logging
import requests
from opentelemetry import trace
from azure.identity import DefaultAzureCredential
from app.config import get_settings

logger = logging.getLogger("uvicorn.error")
tracer = trace.get_tracer(__name__)

#azure_mgmt_apim_base_url = f"https://management.azure.com/subscriptions/{get_settings().azure_subscription_id}/resourceGroups/{get_settings().azure_resource_group}/providers/Microsoft.ApiManagement/service/{get_settings().azure_apim_service_name}"
azure_apim_base_url = f"{get_settings().azure_apim_endpoint}/docs"
azure_apim_service_subscription_key = get_settings().azure_apim_apichat_subscription_key

# Function to get the access token
@tracer.start_as_current_span(name="chat")
def get_access_token():
    credential = DefaultAzureCredential()
    token = credential.get_token("https://management.azure.com/.default")
    return token.token

# Function to fetch APIs that belong to a certain product
@tracer.start_as_current_span(name="fetch_apis_by_product")
def fetch_apis_by_product(product_id, access_token=None):
    headers = {
        'Content-Type': 'application/json'
    }
    if access_token:
        headers['Authorization'] = f'Bearer {access_token}'
    if azure_apim_service_subscription_key:
        headers['Ocp-Apim-Subscription-Key'] = azure_apim_service_subscription_key

    url = f'{azure_apim_base_url}/products/{product_id}/apis?api-version={get_settings().azure_apim_service_api_version}'
    response = requests.get(url,
                            headers=headers,
                            timeout=30)
    response.raise_for_status()
    return response.json()['value']

# Get the OpenAPI JSON file from the export endpoint
@tracer.start_as_current_span(name="fetch_openapi_spec")
def fetch_openapi_spec(api_id, access_token=None):
    headers = {
        'Content-Type': 'application/json'
    }
    if access_token:
        headers['Authorization'] = f'Bearer {access_token}'
    if azure_apim_service_subscription_key:
        headers['Ocp-Apim-Subscription-Key'] = azure_apim_service_subscription_key

    url = f'{azure_apim_base_url}/apis/{api_id}?export=true&format=openapi&api-version={get_settings().azure_apim_service_api_version}'
    response = requests.get(url,
                            headers=headers,
                            timeout=30)
    response.raise_for_status()
    return response.text

__all__ = ["get_access_token", "fetch_apis_by_product", "fetch_openapi_spec"]
