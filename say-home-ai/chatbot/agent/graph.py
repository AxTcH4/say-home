from langgraph.graph import StateGraph, END
from langchain_core.messages import SystemMessage, AIMessage, trim_messages
from typing import TypedDict, Annotated, Literal
from langchain_core.messages import HumanMessage, ToolMessage
import operator
from chatbot.dto.llmSchemas import MessageAnalysisOutput
from langgraph.checkpoint.memory import MemorySaver 
from chatbot.dto.llmSchemas import AgentResponse, ProblemeOutput, TicketOutput,  TicketDecisionOutput, TonaliteOutput
from chatbot.agent.tools import create_ticket, send_email, get_prospect_info, get_prospect_visit_requests
import json
import re

class AgentState(TypedDict):
    

    messages: Annotated[list, operator.add]

    prospect: dict
    prospect_id: int

    intent: str

    problem: str

    problem_found: bool

    rag_context: list

    problem_action: str
    tool_name: str

    ticket: dict

    appointments: list

    awaiting_ticket_confirmation: bool
    needs_clarification: bool

    ticket_already_exists: bool 

    ticket_created: bool

    off_topic: bool
    conversation_tone: str
    ticket_priority: str


def format_prospect_context(prospect: dict, appointments: list) -> str:
    apts_text = ""
    for apt in appointments:
        apts_text += f"""
  - RDV #{apt['id']}: {apt['date']} | {apt.get('meetingType','')} | {apt['status']}
    Propriété: {apt['property']['title']} ({apt['property']['secteur']})
    Agent: {apt.get('agentName','')}
"""
    return f"""
Nom: {prospect["nom"]} {prospect["prenom"]}
Email: {prospect["email"]}
Budget: {prospect["budget"]} MAD
Source: {prospect["source"]}

RENDEZ-VOUS:
{apts_text if apts_text else "Aucun rendez-vous"}
"""

def build_support_scope_context(prospect: dict, appointments: list) -> str:
    owned_properties_text = ""
    for owned_property in prospect.get("ownedProperties", []):
        owned_properties_text += f"""
  - Bien #{owned_property.get('propertyId')}: {owned_property.get('title', 'Bien inconnu')}
    Secteur: {owned_property.get('secteur', '')}
    Type: {owned_property.get('type', '')}
    Statut: {owned_property.get('relationStatus', '')}
"""

    return (
        format_prospect_context(prospect, appointments)
        + f"""

BIENS AUTORISES DANS LE PERIMETRE SAV:
{owned_properties_text if owned_properties_text else "Aucun bien possede ou loue actuellement"}
"""
    )

def analyse_message(state: AgentState, llm) -> AgentState:

    print("Analysing message...")

    last_message = state["messages"][-1].content
    lower_msg = last_message.lower()

    # =========================================================
    # VIEW REQUESTS SHORTCUT
    # =========================================================

    if any(word in lower_msg for word in [
        "mes rendez",
        "mes visites",
        "mes demandes",
        "voir mes",
        "afficher mes"
    ]):

        return {
            **state,
            "intent": "view_requests"
        }

    # =========================================================
    # TICKET CONFIRMATION
    # =========================================================

    if state.get("awaiting_ticket_confirmation"):

        support_keywords = [
            "rendez vous",
            "annuler",
            "reservation",
            "visite",
            "ticket",
            "problème",
            "probleme",
            "clé",
            "réservation",
        ]

        if any(word in lower_msg for word in support_keywords):

            state["awaiting_ticket_confirmation"] = False

        prompt = f"""
        Le client répond à une proposition
        d'ouverture de ticket support.

        Message client:
        "{last_message}"

        Détermine si le client:
        - accepte clairement
        - refuse clairement
        - est ambigu

        Réponds UNIQUEMENT avec:
        - accepted
        - rejected
        - unclear
        """

        response = llm.invoke([
            SystemMessage(content=prompt)
        ])

        decision = (
            response.content
            .strip()
            .lower()
        )

        print(f"Ticket confirmation decision: {decision}")

        if decision == "accepted":

            intent = "ticket_yes"

        elif decision == "rejected":

            intent = "ticket_no"

        else:

            return {
                **state,
                "messages":
                    state["messages"] + [
                        AIMessage(
                            content=
                                "Je n'ai pas bien compris. "
                                "Souhaitez-vous que je crée "
                                "un ticket de support ?"
                        )
                    ]
            }

        return {
            **state,
            "intent": intent
        }

    # =========================================================
    # NORMAL INTENT CLASSIFICATION
    # =========================================================

    trimmed = trim_messages(
        state["messages"],
        max_tokens=1200,
        strategy="last",
        token_counter=llm,
    )

    prompt = """
    Analyse UNIQUEMENT le dernier message du client.

    Choisis UN SEUL intent:

    - support:
    questions SAV,
    documents,
    procédures,
    problèmes,
    réclamations,
    questions métier immobilières,
    demandes liées au processus
    d'achat/location

    - appointment_action:
    annuler ou modifier un rendez-vous

    - general:
    salutation ou conversation simple

    - out_of_scope:
    sujet hors SAV SAY Home, hors rendez-vous,
    hors documents, hors suivi des biens du prospect

    IMPORTANT:
    - Les questions générales immobilières
    ou administratives utilisent:
    support

    - Réponds uniquement avec l'intent
    """

    prompt += """

    Tu es strictement un assistant SAV SAY Home.
    Si le message est hors SAV, hors rendez-vous, hors documents,
    ou hors suivi des biens SAY Home du prospect, classe-le en out_of_scope.
    """

    structured_llm = llm.with_structured_output(
        MessageAnalysisOutput
    )

    response = structured_llm.invoke([
        SystemMessage(content=prompt),
        *trimmed
    ])

    return {
        **state,

        "intent": response.intent,
        "off_topic": response.intent == "out_of_scope",

        "problem": last_message,

        "problem_action":
            "tool"
            if response.intent == "appointment_action"
            else "rag"
    }
def route_intent(state: AgentState) -> str:

    intent = state.get("intent", "general")

    if intent == "ticket_yes":
        return "analyser_tonalite_ticket"

    if intent == "ticket_no":
        return "cloturer_conversation"

    if intent == "general":
        return "cloturer_conversation"

    if intent == "out_of_scope":
        return "recentrer_sav"
    
    if intent == "view_requests":
        return "repondre_visites"

    return "verifier_clarte"

def verifier_clarte_message(state: AgentState, llm) -> AgentState:
    last_message = state["messages"][-1].content

    prompt = f"""
    Analyse le dernier message du client.

    Reponds UNIQUEMENT avec:
    - clear
    - vague

    Considere le message comme vague si:
    - le probleme n'est pas explique
    - le client dit seulement qu'il a un probleme ou une reclamation
    - il mentionne juste une propriete ou un sujet sans expliquer ce qui ne va pas

    Message:
    "{last_message}"
    """

    response = llm.invoke([
        SystemMessage(content=prompt)
    ])

    clarity = response.content.strip().lower()

    if clarity == "vague":
        return {
            **state,
            "needs_clarification": True,
            "messages": state["messages"] + [
                AIMessage(
                    content=(
                        "Pouvez-vous preciser clairement le probleme rencontre "
                        "avec votre propriete, votre rendez-vous, vos documents "
                        "ou votre dossier SAY Home ?"
                    )
                )
            ]
        }

    return {
        **state,
        "needs_clarification": False,
    }

def analyser_tonalite_ticket(state: AgentState, llm) -> AgentState:
    print("Analysing ticket tonality...")

    trimmed = trim_messages(
        state["messages"],
        max_tokens=1000,
        strategy="last",
        token_counter=llm,
    )

    prompt = """
    Tu analyses la tonalite d'une conversation SAV SAY Home.

    Releve:
    - tone:
      - angry: client frustre, presse, inquiet, bloquant, ton fort
      - calm: ton normal, demande simple ou neutre
    - clarity:
      - clear
      - vague
    - requests_info:
      - true si le client demande surtout des informations
      - false sinon
    """

    structured_llm = llm.with_structured_output(TonaliteOutput)
    response = structured_llm.invoke([
        SystemMessage(content=prompt),
        *trimmed
    ])

    priority = "MEDIUM"
    last_message = state.get("problem", "").lower()
    requests_info = response.requests_info

    if isinstance(requests_info, str):
        requests_info = requests_info.strip().lower() == "true"

    urgent_keywords = [
        "urgent",
        "urgence",
        "bloque",
        "bloqué",
        "impossible",
        "fuite",
        "danger",
        "grave",
        "immediat",
        "immédiat",
        "tout de suite",
        "rapidement",
    ]

    light_keywords = [
        "information",
        "renseignement",
        "question",
        "simple",
    ]

    if response.tone == "angry" or any(keyword in last_message for keyword in urgent_keywords):
        priority = "HIGH"
    elif requests_info and response.tone == "calm" and any(keyword in last_message for keyword in light_keywords):
        priority = "LOW"

    return {
        **state,
        "conversation_tone": response.tone,
        "ticket_priority": priority,
    }

def route_clarity(state: AgentState) -> str:
    if state.get("needs_clarification"):
        return END
    return "identifier_probleme"

def repondre_visites(state: AgentState) -> AgentState:

    print("Getting visit requests...")

    result = get_prospect_visit_requests.invoke({
        "prospect_id": state["prospect_id"]
    })

    if not result.get("success", True):

        return {
            **state,
            "messages": state["messages"] + [
                AIMessage(content=""" Désolé, une erreur est survenue lors de la récupération de vos demandes de visite. Veuillez réessayer plus tard.""")
            ]
        }

    requests = result.get("data", [])

    if not requests:

        return {
            **state,
            "messages": state["messages"] + [
                AIMessage(content=""" Vous n'avez actuellement aucune demande de visite.""")
            ]
        }
    print(f"RAW Response: {requests}")

    formatted = ""

    for i, req in enumerate(requests, start=1):

        property_title = (
            req
            .get("propertyTitle", "Bien inconnu")
        )

        status = req.get("status", "UNKNOWN")

        date = req.get("requesetedDate", "Date inconnue")

        time = req.get("requesetedTime", "Heure inconnue")



        agent = req.get("agentName", "Non assigné")

        formatted += (
    f"\n{i}. {property_title}\n"
    f"   • Statut : {status.lower()}\n"
    f"   • Date : {date}\n"
    f"   • Heure : {time}\n"
    f"   • Agent : {agent}\n"
)

    return {
        **state,
        "messages": state["messages"] + [
            AIMessage(
    content= "Voici vos demandes de visite :\n"
        f"{formatted}"
)
        ]
    }

def extract_action_and_tool(rag_text: str):

    action_match = re.search(
        r"ACTION:\s*(\w+)",
        rag_text,
        re.IGNORECASE
    )

    tool_match = re.search(
        r"OUTIL:\s*([^\s]+)",
        rag_text,
        re.IGNORECASE
    )

    action = (
        action_match.group(1).strip().lower()
        if action_match
        else "rag"
    )

    tool = (
        tool_match.group(1).strip().lower()
        if tool_match
        else None
    )

    return action, tool

def identifier_probleme(
    state: AgentState,
    llm,
    embedder,
    qdrant
) -> AgentState:

    print("Identifying problem...")

    user_messages = [
        m.content
        for m in state["messages"]
        if isinstance(m, HumanMessage)
    ]

    raw_query = user_messages[-1] if user_messages else ""

    query = raw_query.strip()

    print(f"Query: '{query}'")

    embedded_msg = embedder.embedText(query)

    count = qdrant.client.count(
        collection_name=qdrant.collection_name
    )

    print(f"Total vectors in Qdrant: {count}")

    try:

        results = qdrant.search(
            embedded_msg,
            limit=3
        )

    except Exception as e:

        print(f"Qdrant error: {e}")

        results = []

    print(f"RAG results: {results}")

    problem_found = len(results) > 0

    rag_context = "\n".join(results)

    action = "rag"
    tool = None

    if results:
        action, tool = extract_action_and_tool(
            results[0]
        )

    print(f"Detected action: {action}")
    print(f"Detected tool: {tool}")

    # =========================================================
# SKIP CLARITY CHECK FOR KNOWN TOOLS
    # =========================================================

    if tool is not None:

        return {
            **state,

            "problem_found": problem_found,

            "problem": raw_query,

            "rag_context": results,

            "problem_action": action,

            "tool_name": tool,

            "needs_clarification": False,
        }



    clarification_prompt = f"""
        Le message du client est-il suffisamment
        clair et précis pour comprendre
        le problème et agir dessus ?

        Si le client mentionne seulement une propriete
        ou un sujet sans expliquer le probleme,
        considere le message comme vague.

        Message:
        "{raw_query}"

        Réponds UNIQUEMENT avec:
        - clear
        - vague
        """

    clarity_response = llm.invoke([
    SystemMessage(content=clarification_prompt)
    ])

    clarity = clarity_response.content.strip().lower()

    print(f"Clarity: {clarity}")

    if clarity == "vague":

        return {
            **state,

            "needs_clarification": True,

            "messages":
                state["messages"] + [
                    AIMessage(content=""" Pouvez-vous préciser le problème rencontré afin que je puisse vous aider correctement ?""")
                ]
        }

    return {
        **state,

        "problem_found": problem_found,

        "problem": raw_query,

        "rag_context": results,

        "problem_action": action,

        "tool_name": tool,

        "needs_clarification": False,
    }

def probleme_existe(state: AgentState) -> str:

    if state.get("needs_clarification"):
        return END

    if not state["problem_found"]:
        return "cloturer_conversation"

    return "resoudre_et_demander"

def resoudre_et_demander(
    state: AgentState,
    llm
) -> AgentState:

    print("Resolving problem...")

    from chatbot.agent.tools import (
        cancel_appointment,
        get_prospect_visit_requests
    )

    trimmed = trim_messages(
        state["messages"],
        max_tokens=800,
        strategy="last",
        token_counter=llm,
    )

    action = state.get("problem_action", "rag")

  
    if action == "tool":

        user_message = state["problem"].lower()

        tool_name = state.get("tool_name")

        if tool_name == "ticket":

            return {
                **state,

                "awaiting_ticket_confirmation": True,

                "messages":
                    state["messages"] + [
                        AIMessage(content=""" Ce problème nécessite
                        l'ouverture d'un ticket afin qu'une équipe puisse vous contacter.

                        Voulez-vous que je crée un ticket de support ?""")
                    ]
            }

    #     if "rendez-vous" in user_message or "reservation" in user_message:

    #         result = get_prospect_visit_requests.invoke({
    #             "prospect_id": state["prospect_id"]
    #         })

    #         return {
    #             **state,
    #             "messages": state["messages"] + [
    #                 AIMessage(content=f"""
    # Voici vos rendez-vous:

    # {result}
    # """)
    #             ]
    #         }

    # RAG FLOW
    rag_context = "\n".join(
        state.get("rag_context", [])
    )

    prompt = f"""
    Tu es un agent SAV SAY Home.

    Réponds au client en utilisant
    UNIQUEMENT le contexte suivant.

    CONTEXTE:
    {rag_context}

    Si le contexte ne contient pas
    la réponse, dis que le problème
    sera transféré au support.
    """

    prompt += f"""

    PERIMETRE STRICT:
    - service apres-vente SAY Home
    - rendez-vous du client
    - documents du client
    - biens que le prospect possede deja ou loue deja via SAY Home
    - si le client parle d'un autre sujet ou d'un autre bien,
      recentre-le poliment vers le support SAY Home

    CONTEXTE PROSPECT:
    {build_support_scope_context(state["prospect"], state.get("appointments", []))}
    """

    response = llm.invoke([
        SystemMessage(content=prompt),
        *trimmed
    ])

    return {
        **state,
        "messages":
            state["messages"] + [
                AIMessage(content=response.content)
            ]
    }

def execute_tools(response, available_tools: dict):
    tool_results = []

    if not response.tool_calls:
        return tool_results

    for tool_call in response.tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]

        print(f"Executing tool: {tool_name}")
        print(f"Args: {tool_args}")

        tool = available_tools.get(tool_name)

        if not tool:
            continue

        try:
            result = tool.invoke(tool_args)

            tool_results.append(
                ToolMessage(
                    content=str(result),
                    tool_call_id=tool_call["id"]
                )
            )

        except Exception as e:
            tool_results.append(
                ToolMessage(
                    content=f"Tool execution error: {str(e)}",
                    tool_call_id=tool_call["id"]
                )
            )

    return tool_results

def verifier_ou_creer_ticket(state: AgentState, llm) -> AgentState:

    print("Checking if ticket exists...")
    
    trimmed = trim_messages(
        state["messages"],
        max_tokens=2000,
        strategy="last",
        token_counter=llm,
    )
    # TODO: import verification tool
    from chatbot.agent.tools import get_latest_active_ticket
    
    ticket_result = get_latest_active_ticket.invoke({
        "prospect_id": state["prospect_id"]
    })

    if ticket_result.get("exists"):
        ticket = ticket_result.get("data", {})
        return {
            **state,
            "awaiting_ticket_confirmation": False,
            "ticket_created": True,
            "ticket": ticket,
            "ticket_already_exists": True,
            "messages":
                state["messages"] + [
                    AIMessage(
                    content=
                        "Un ticket de support est déjà  en cours de traitement. Notre équipe vous contactera prochainement."
                )
                ]
        }
    
    prompt = f"""
Tu es un agent SAY Home. 
Analyse le problème et génère un titre et une description de ticket.
Problème: {state["problem"]}
    """
    
    prompt += f"""

Limite le sujet aux biens possedes ou loues par le prospect.
Contexte prospect:
{build_support_scope_context(state["prospect"], state.get("appointments", []))}

La priorite a deja ete determinee a partir de la tonalite:
{state.get("ticket_priority", "MEDIUM")}
    """

    structured_llm = llm.with_structured_output(TicketOutput)
    response = structured_llm.invoke([
        SystemMessage(content=prompt),
        *trimmed
    ])

    ticket_result = create_ticket.invoke({
        "prospect_id": state["prospect_id"],
        "title": response.title,
        "description": response.description,
        "priority": state.get("ticket_priority", response.priority),
    })

    print(ticket_result)
    
    if not ticket_result.get("success", True):

        return {
            **state,
            "awaiting_ticket_confirmation": False,
            "ticket_created": False,
            "messages":
                state["messages"] + [
                    AIMessage(content=""" Une erreur est survenue lors de la création du ticket. Veuillez réessayer plus tard.""")
                ]
        }

    return {**state,
            "awaiting_ticket_confirmation": False,
            "ticket_created": True,
            "ticket_already_exists": False,
            "ticket" : {
                "id": ticket_result["data"]["id"],
                "title": ticket_result["data"] ["title"],
                "description": ticket_result["data"] ["description"],
                "priority": ticket_result["data"] ["priority"],
                "status": ticket_result["data"] ["status"],
            }}

def route_ticket_result(state: AgentState):

    if state.get("ticket_already_exists"):
        return END

    return "envoyer_email_confirmation"

def envoyer_email_confirmation(state: AgentState) -> AgentState:
    print("Sending email...")
    
    if not state["ticket"]:
        return {**state }
    
    email_result = send_email.invoke({
        "email": state["prospect"]["email"],
        "ticket_id": state["ticket"]["id"],
        "ticket_title": state["ticket"]["title"],
        "ticket_description": state["ticket"]["description"],
        "ticket_priority": state["ticket"]["priority"],
        "ticket_status": state["ticket"]["status"],
        "prospect_FirstName": state["prospect"]["nom"],
        # "createdAt": state["ticket"]["createdAt"],
    })

    if not email_result.get("success", True):
        print(f"Email confirmation failed: {email_result.get('error')}")
    
    return {**state,
            "is_sent": True
            }

def informer_prospect(state: AgentState, llm) -> AgentState:
    print("Informing prospect...")
    
    trimmed = trim_messages(
        state["messages"],
        max_tokens=2000,
        strategy="last",
        token_counter=llm,
    )
    prompt = f"""
        Tu es un agent SAY Home. 
        Informe le prospect que le ticket a bien été créer, un email de confirmation a aussi been envoyé et le ticket est en cours de traitement.
    """
    
    structured_llm = llm.with_structured_output(AgentResponse)
    response = structured_llm.invoke([
        SystemMessage(content=prompt),
        *trimmed
    ])
    
    return (
        {**state, "messages": state["messages"] + [AIMessage(content=response.message)]}
    )

def cloturer_conversation(state: AgentState, llm) -> AgentState:
    print("Ending convo...")
    
    trimmed = trim_messages(
        state["messages"],
        max_tokens=2000,
        strategy="last",
        token_counter=llm,
    )
    prompt = f"""
        Tu es un agent SAY Home.
        Termine la conversation avec le client poliment.
        Si le message est hors sujet, rappelle que ton role
        est centre sur le SAV SAY Home, les rendez-vous,
        les documents et le suivi de ses biens SAY Home.
    """
    
    structured_llm = llm.with_structured_output(AgentResponse)
    response = structured_llm.invoke([
        SystemMessage(content=prompt),
        *trimmed
    ])
    
    return (
        {**state, "messages": state["messages"] + [AIMessage(content=response.message)]}
    )

def recentrer_sav(state: AgentState) -> AgentState:
    return {
        **state,
        "messages": state["messages"] + [
            AIMessage(
                content=(
                    "Je suis un assistant SAV SAY Home. "
                    "Si vous avez un probleme en relation avec une de vos proprietes, "
                    "vos documents, vos rendez-vous ou le suivi de votre dossier, "
                    "feel free to ask."
                )
            )
        ]
    }



def build_graph(llm, embedder, qdrant):

    graph = StateGraph(AgentState)

    checkpointer = MemorySaver()

    # NODES
    graph.add_node(
        "analyse_message",
        lambda state: analyse_message(state, llm)
    )

    graph.add_node(
        "identifier_probleme",
        lambda state: identifier_probleme(
            state,
            llm,
            embedder,
            qdrant
        )
    )
    graph.add_node(
        "verifier_clarte",
        lambda state: verifier_clarte_message(
            state,
            llm
        )
    )

    graph.add_node(
        "resoudre_et_demander",
        lambda state: resoudre_et_demander(
            state,
            llm
        )
    )

    graph.add_node(
        "analyser_tonalite_ticket",
        lambda state: analyser_tonalite_ticket(
            state,
            llm
        )
    )

    graph.add_node(
        "verifier_ou_creer_ticket",
        lambda state: verifier_ou_creer_ticket(
            state,
            llm
        )
    )

    graph.add_node(
        "envoyer_email_confirmation",
        lambda state: envoyer_email_confirmation(
            state
        )
    )

    graph.add_node(
        "informer_prospect",
        lambda state: informer_prospect(
            state,
            llm
        )
    )

    graph.add_node(
        "cloturer_conversation",
        lambda state: cloturer_conversation(
            state,
            llm
        )
    )
    graph.add_node(
        "recentrer_sav",
        lambda state: recentrer_sav(state)
    )
    graph.add_node(
    "repondre_visites",
    lambda state: repondre_visites(state)
)



    # ENTRY POINT
    graph.set_entry_point("analyse_message")

    # CONDITIONAL ROUTING
    graph.add_conditional_edges(
        "analyse_message",
        route_intent
    )

    graph.add_conditional_edges(
        "verifier_clarte",
        route_clarity
    )

    graph.add_conditional_edges(
        "identifier_probleme",
        probleme_existe
    )

    # NORMAL EDGES
    graph.add_edge(
        "resoudre_et_demander",
        END
    )


    graph.add_edge(
        "analyser_tonalite_ticket",
        "verifier_ou_creer_ticket"
    )

    graph.add_conditional_edges(
        "verifier_ou_creer_ticket",
        route_ticket_result
    )

    graph.add_edge(
        "envoyer_email_confirmation",
        "informer_prospect"
    )

    graph.add_edge(
        "informer_prospect",
        END
    )

    graph.add_edge(
    "repondre_visites",
    END
)

    graph.add_edge(
        "recentrer_sav",
        END
    )

    graph.add_edge(
        "cloturer_conversation",
        END
    )

    return graph.compile(
        checkpointer=checkpointer
    )
