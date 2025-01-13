from pydantic import BaseModel

class ChatCreateThreadInput(BaseModel):
    agent_id: str

__all__ = ["ChatCreateThreadInput"]
