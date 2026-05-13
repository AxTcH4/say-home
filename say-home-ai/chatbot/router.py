from fastapi import APIRouter, Request
from chatbot.service import ChatbotService
from chatbot.dto.requestSchemas import HelpDeskAgentRequest
router = APIRouter()


@router.post("/reply")
async def getAgentReply(
    request: HelpDeskAgentRequest,
    req: Request
):
    print("Hit Endpoint!!!")
    print(HelpDeskAgentRequest.display(request))    
    result = req.app.state.chatbot_service.getBotReply(request)
    print (result)
    return {
        "content": result
    }
