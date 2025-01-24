from pydantic import BaseModel
from typing import List

class ApiResponse(BaseModel):
    api_id: str
    name: str = None

__all__ = ["ProductIds", "ApiResponse"]
