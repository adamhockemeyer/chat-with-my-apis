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

logger = logging.getLogger(__name__)
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

    trace.get_current_span().set_attribute("params.plugin_name", plugin_name)

    parser = ResolvingParser(spec_string=openapi_spec, resolve_types = resolver.RESOLVE_FILES, strict=False, recursion_limit=10)
    parsed_spec = parser.specification

    # Log the first server URL (if present)
    if "servers" in parsed_spec and parsed_spec["servers"]:
        server_url = parsed_spec["servers"][0].get("url", "")
        logger.info(f"      ☁️ OpenAPI Server Url: {server_url}")
        trace.get_current_span().set_attribute("params.server_url", server_url)

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

@tracer.start_as_current_span(name="add_apim_api")
async def add_apim_api(kernel, api_id):
    openapi_spec = await fetch_openapi_spec(api_id)
    plugin_name = sanitize_plugin_name(api_id)
    await add_openapi_plugin(kernel, plugin_name, openapi_spec)

@tracer.start_as_current_span(name="add_apim_apis_by_product")
async def add_apim_apis_by_product(kernel, product_id):
    # Fetch the APIs that belong to the specified product
    trace.get_current_span().set_attribute("params.product_id", product_id)

    apis = await fetch_apis_by_product(product_id)

    # Add the OpenAPI plugins for each API
    for api in apis:
        await add_apim_api(kernel, api['name'])

__all__ = ["add_apim_apis_by_product", "add_apim_api"]
