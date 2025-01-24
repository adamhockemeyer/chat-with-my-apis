from pydantic import BaseModel
from typing import List

class ProductResponse(BaseModel):
    product_id: str
    name: str = None

__all__ = ["ProductResponse"]
