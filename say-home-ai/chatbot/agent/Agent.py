from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, AIMessage
from langchain_groq import ChatGroq
import os

from chatbot.agent.graph import build_graph

load_dotenv()


class Agent:
    def __init__(self, embedder, qdrant):
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            api_key=os.getenv("GROQ_API_KEY")
        )

        self.embedder = embedder
        self.qdrant = qdrant
        self.app = build_graph(self.llm, self.embedder, self.qdrant)

    def run(
    self,
    prompt: str,
    session_id: str,
    prospect: dict = None
):

        config = {
            "configurable": {
                "thread_id": session_id
            }
        }

        state = self.app.get_state(config)

        input_data = {
            "messages": [
                HumanMessage(content=prompt)
            ]
        }

        # First interaction only
        if not state.values:

            if not prospect:
                return "Erreur: prospect manquant."

            input_data.update({

                "prospect": prospect,

                "prospect_id": prospect["prospectId"],

                "appointments":
                    prospect.get("appointments", []),

                "intent": "general",

                "problem": "",

                "problem_found": False,

                "rag_context": [],

                "problem_action": "rag",

                "tool_name": "",

                "awaiting_ticket_confirmation": False,

                "ticket": {},

                "needs_clarification": False,

                "ticket_created": False,
            })
        result = self.app.invoke(
            input_data,
            config=config
        )

        ai_messages = [
            m for m in result["messages"]
            if isinstance(m, AIMessage)
        ]

        if not ai_messages:
            return "En cours de traitement..."

        return ai_messages[-1].content