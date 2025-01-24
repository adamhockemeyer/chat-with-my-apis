import logging
from fastapi import APIRouter
from typing import List
from app.models.api_response import ApiResponse
from opentelemetry import trace
from app.services.apim import fetch_apis_by_product
from app.config import get_settings

logger = logging.getLogger("uvicorn.error")
tracer = trace.get_tracer(__name__)

router = APIRouter()

@tracer.start_as_current_span(name="get_apis")
@router.get("/apis/{product_id}", response_model=List[ApiResponse])
async def get_apis(product_id: str):
    apis = []
    logger.info(f"  ⚡Fetching APIs for product '{product_id}'")
    try:
        product_apis = fetch_apis_by_product(product_id)
        for api in product_apis:
            apis.append(ApiResponse(
                api_id=api['name'],
                name=api['properties'].get('displayName', 'No Name')
            ))
    except Exception as e:
        logger.error(f"Exception occurred while fetching APIs for product '{product_id}'. Exception: {e}")
    
    return apis
