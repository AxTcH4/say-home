from chatbot.agent.Agent import Agent
from chatbot.dto.requestSchemas import HelpDeskAgentRequest


class ChatbotService:
    def __init__(self, embedder, storage):
         
        self.agent = Agent(embedder, storage)
    def getBotReply(self, data: HelpDeskAgentRequest):
        session_id = data.messageRequest.session["id"]
        prompt = data.messageRequest.content
        
        # prospect = None
        # if data.prospectId:
        is_first_message = len(data.messageRequest.session.get("messages", [])) == 0
    
        prospect = None
        if is_first_message:
            prospect = {
                "prospectId": data.messageRequest.session["prospect"]["id"],
                "nom": data.messageRequest.session["prospect"]["user"]["firstName"],
                "prenom": data.messageRequest.session["prospect"]["user"]["lastName"],
                "email": data.messageRequest.session["prospect"]["user"]["email"],
                "ville": data.messageRequest.session["prospect"].get("city"),
                "user": data.messageRequest.session["prospect"]["user"],
                "source": data.messageRequest.session["prospect"].get("source"),
                "appointments": data.appointments,
                "budget": data.messageRequest.session["prospect"].get("budget"),
                "appointments": [apt for apt in data.messageRequest.appointments] if data.messageRequest.appointments else [],

            }
        # return "ok"
        return self.agent.run(prompt, session_id, prospect)