import logging
from fastapi import APIRouter
from typing import List
from app.models.api_response import ApiResponse
from app.models.product_response import ProductResponse
from opentelemetry import trace
from app.services.apim import fetch_apis_by_product, fetch_products_name_contains
from app.config import get_settings

logger = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)

router = APIRouter()

@tracer.start_as_current_span(name="get_apis")
@router.get("/apis/{product_id}", response_model=List[ApiResponse])
async def get_apis(product_id: str):
    apis = []
    logger.info(f"  ⚡Fetching APIs for product '{product_id}'")
    try:
        product_apis = await fetch_apis_by_product(product_id)
        for api in product_apis:
            apis.append(ApiResponse(
                api_id=api['name'],
                name=api['properties'].get('displayName', 'No Name')
            ))
    except Exception as e:
        logger.error(f"Exception occurred while fetching APIs for product '{product_id}'. Exception: {e}")
    
    return apis

@tracer.start_as_current_span(name="get_agent_products")
@router.get("/agent-products", response_model=List[ProductResponse])
async def get_agent_products():

    logger.info("  ⚡Fetching products that contain 'agent'")
    try:

        products_data = await fetch_products_name_contains("agent")
        results = []
        for product in products_data:
            product_id = product.get("name", "")
            display_name = product.get("properties", {}).get("displayName", "No Name")
            results.append(ProductResponse(product_id=product_id, name=display_name))
        return results
    except Exception as e:
        logger.error(f"Exception occurred while fetching 'agent' products. Exception: {e}")
        return []