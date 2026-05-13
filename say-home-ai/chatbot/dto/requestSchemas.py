from pydantic import BaseModel

from pydantic import BaseModel
from typing import Optional
class ChatMessageRequest(BaseModel):
    # id: Optional[int] = None
    content: str
    sender: Optional[str] = None
    session: Optional[dict] = None
    appointments: Optional[list] = []

class HelpDeskAgentRequest(BaseModel):
    # prospectId: Optional[int] = None
    # city: Optional[str] = None
    # source: Optional[str] = None
    # budget: Optional[float] = None
    # prospectStatus: Optional[str] = None
    
    # user: Optional[dict] = None
    messageRequest: ChatMessageRequest
    appointments: Optional[list] = []
    # sessionId: Optional[int] = None
    @staticmethod
    def display(request: 'HelpDeskAgentRequest') -> str:
        import json
        return json.dumps(request.model_dump(), indent=2, default=str)