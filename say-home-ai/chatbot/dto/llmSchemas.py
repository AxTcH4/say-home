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
        "appointment_action",
        "general",
        "out_of_scope"
    ]
class TicketOutput(BaseModel):
    title: str
    description: str
    priority: Literal["HIGH", "MEDIUM", "LOW"]
    # createdAt: str
    # status: str


class TonaliteOutput(BaseModel):
    tone: Literal["angry", "calm"]
    clarity: Literal["clear", "vague"] 
    requests_info: Literal[True, False, "true", "false"]

class SatisfactionOutput(BaseModel):
    satisfied: bool
    is_clear: bool

class TicketDecisionOutput(BaseModel):
    wants_ticket: bool
    is_clear: bool
