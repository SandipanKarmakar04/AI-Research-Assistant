from pydantic import BaseModel
from datetime import datetime

class Session(BaseModel):
    title: str
    createdAt: datetime = datetime.utcnow()


class Message(BaseModel):
    sessionId: str
    role: str   # "user" or "assistant"
    content: str
    timestamp: datetime = datetime.utcnow()