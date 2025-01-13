from typing import List
from pydantic import BaseModel

class ChatInput(BaseModel):
    agent_id: str
    thread_id: str
    content: str

__all__ = ["ChatInput"]
