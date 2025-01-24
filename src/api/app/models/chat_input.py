from typing import List, Optional
from pydantic import BaseModel

class ChatInput(BaseModel):
    agent_id: str
    thread_id: str
    content: str
    product_id: Optional[str] = None
    api_ids: Optional[List[str]] = None

__all__ = ["ChatInput"]
