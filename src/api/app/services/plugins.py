import re
import os
import logging
from opentelemetry import trace
from prance import ResolvingParser
from prance.util import resolver
from semantic_kernel.kernel import Kernel
from semantic_kernel.connectors.openapi_plugin.openapi_function_execution_parameters import OpenAPIFunctionExecutionParameters
from app.config import get_settings

from app.services.apim import get_access_token, fetch_apis_by_product, fetch_openapi_spec

logger = logging.getLogger("uvicorn.error")
tracer = trace.get_tracer(__name__)

@tracer.start_as_current_span(name="sanitize_plugin_name")
def sanitize_plugin_name(name):
    # Replace any character that is not a letter, number, or underscore with an underscore
    sanitized_name = re.sub(r'[^0-9A-Za-z_]', '_', name)
    # Remove leading underscores or numbers to ensure valid identifier if necessary
    sanitized_name = re.sub(r'^[^A-Za-z]+', '', sanitized_name)
    # Ensure the name is not empty
    if not sanitized_name:
        sanitized_name = 'plugin'
    return sanitized_name

@tracer.start_as_current_span(name="add_openapi_plugin")
async def add_openapi_plugin(kernel: Kernel, plugin_name:str, openapi_spec: str):
    logger.info(f"  ⚡Adding OpenAPI Plugin '{plugin_name}'")

    parser = ResolvingParser(spec_string=openapi_spec, resolve_types = resolver.RESOLVE_FILES, strict=False, recursion_limit=10)
    parsed_spec = parser.specification

    async def my_auth_callback(**kwargs):
        return {"Ocp-Apim-Subscription-Key": get_settings().azure_apim_service_subscription_key, "Content-Type": "application/json"}

    kernel.add_plugin_from_openapi(
        plugin_name=plugin_name,
        openapi_parsed_spec=parsed_spec,
        execution_settings=OpenAPIFunctionExecutionParameters(
                # Determines whether payload parameter names are augmented with namespaces.
                # Namespaces prevent naming conflicts by adding the parent parameter name
                # as a prefix, separated by dots
                auth_callback=my_auth_callback,
                enable_payload_namespacing=True
        )
    )

@tracer.start_as_current_span(name="add_apim_apis_by_product")
async def add_apim_apis_by_product(kernel, product_id):
    # Get the access token
    #access_token = get_access_token()

    # Fetch the APIs that belong to the specified product
    apis = fetch_apis_by_product(product_id)

    # Add the OpenAPI plugins for each API
    plugin_names = set()
    for api in apis:
        openapi_spec = fetch_openapi_spec(api['name'])
        # Sanitize the plugin_name
        name_candidate = sanitize_plugin_name(api['name'])
        # Ensure the plugin_name is unique
        plugin_name = name_candidate
        counter = 1
        while plugin_name in plugin_names:
            plugin_name = f"{name_candidate}_{counter}"
            counter += 1
        plugin_names.add(plugin_name)
        await add_openapi_plugin(kernel, plugin_name, openapi_spec)

__all__ = ["add_apim_apis_by_product"]
