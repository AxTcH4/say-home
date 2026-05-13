from pydantic import BaseModel
from typing import Literal

class AgentResponse(BaseModel):
    message: str

class ProblemeOutput(AgentResponse):
    problem: str
    category: Literal["online", "onsite", "unknown"]
    action: Literal["rag", "tool", "ticket", "unknown"]

class MessageAnalysisOutput(BaseModel):

    intent: Literal[
        "support",
        "info_request",
        "appointment_action",
        "general"
    ]
class TicketOutput(BaseModel):
    title: str
    description: str
    # priority: Literal["HIGH", "MEDIUM", "LOW"]
    # createdAt: str
    # status: str


class TonaliteOutput(BaseModel):
    tone: Literal["angry", "calm"]
    clarity: Literal["clear", "vague"] 
    requests_info: bool

class SatisfactionOutput(BaseModel):
    satisfied: bool
    is_clear: bool

class TicketDecisionOutput(BaseModel):
    wants_ticket: bool
    is_clear: bool