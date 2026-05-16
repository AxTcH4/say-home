from langchain_core.tools import tool
import httpx
from dotenv import load_dotenv
import threading

import os

load_dotenv()

@tool
def create_ticket(
    title: str,
    description: str,
    prospect_id: int,
    priority: str = "MEDIUM"
) -> dict:

    """Create a support ticket."""

    print("Called create_ticket tool")

    try:

        response = httpx.post(
            f"{os.environ.get('BACKEND_API_URL')}/helpdesk/tickets/new",
            headers={
                "X-Internal-Key":
                    os.environ.get("INTERNAL_API_KEY"),
            },
            json={
                "title": title,
                "description": description,
                "prospectId": prospect_id,
                "priority": priority
            },
            timeout=10
        )

        response.raise_for_status()

        return response.json()

    except Exception as e:

        print(f"create_ticket error: {e}")

        return {
            "success": False,
            "error": str(e)
        }
@tool
def send_email(email, ticket_id, ticket_title, ticket_description, ticket_priority, ticket_status, prospect_FirstName):
    """Send a comfirmation email from the SAY Home system to the prospect."""

    print ("Called send_email tool")
    # form the email content 
    email_subject = f"Confirmation de ticket #{ticket_id}"
    email_greeting = f"""Bonjour {prospect_FirstName},"""
    email_footnote= f"""Merci d'avoir utilisé SAY Home.'."""
    email_content = f"""


Le ticket #{ticket_id} a bien été créer et un email de confirmation a aussi been envoyé.
Vous serez contacté par un agent de notre equipe dans les plus bref delais.
<br/>
Titre: {ticket_title}
<br/>
Description: {ticket_description}
"""

    payload = {
        "subject": email_subject,
        "greeting": email_greeting,
        "body": email_content,
        "footnote": email_footnote,
        "email": email,
    }

    headers = {
        "X-Internal-Key": os.environ.get('INTERNAL_API_KEY'),
    }

    def _send_async():
        try:
            response = httpx.post(
                f"{os.environ.get('BACKEND_API_URL')}/helpdesk/tickets/comfirmation",
                headers=headers,
                json=payload,
                timeout=10,
            )
            response.raise_for_status()
            print("ticket confirmation email sent")
        except Exception as e:
            print(f"send_email async error: {e}")

    try:
        threading.Thread(target=_send_async, daemon=True).start()
        return {
            "success": True,
            "queued": True
        }
    except Exception as e:
        print(f"send_email error: {e}")
        return {
            "success": False,
            "error": str(e)
        }

@tool
def get_prospect_visit_requests(prospect_id: int):

    """Get prospect appointments."""

    try:

        response = httpx.get(
            f"{os.environ.get('BACKEND_API_URL')}/appointments/requests/prospect/{prospect_id}",
            headers={
                "X-Internal-Key":
                    os.environ.get("INTERNAL_API_KEY")
            },
            timeout=10
        )

        response.raise_for_status()

        return response.json()

    except Exception as e:

        print(f"appointments error: {e}")

        return {
            "success": False,
            "error": str(e)
        }

@tool
def get_prospect_info(prospect_id: int):

    """Get prospect profile info."""

    try:

        response = httpx.get(
            f"{os.environ.get('BACKEND_API_URL')}/prospects/{prospect_id}",
            headers={
                "X-Internal-Key":
                    os.environ.get("INTERNAL_API_KEY")
            },
            timeout=10
        )

        response.raise_for_status()

        return response.json()

    except Exception as e:

        print(f"get_prospect_info error: {e}")

        return {
            "success": False,
            "error": str(e)
        }

@tool
def get_prospect_doc(prospect_id: int ):
    """Get a requested document of a prospect."""
    pass

@tool
def cancel_appointment(appointment_id: int):

    """Cancel appointment."""

    print("Called cancel_appointment")

    try:

        response = httpx.patch(
            f"{os.environ.get('BACKEND_API_URL')}/appointments/{appointment_id}/cancel",
            headers={
                "X-Internal-Key":
                    os.environ.get("INTERNAL_API_KEY")
            },
            json={
                "status": "CANCELLED"
            },
            timeout=10
        )

        response.raise_for_status()

        return response.json()

    except Exception as e:

        print(f"cancel_appointment error: {e}")

        return {
            "success": False,
            "error": str(e)
        }
    
@tool
def get_latest_active_ticket(prospect_id: int):
    """Get the latest active ticket by prospect id"""   

    print("Called get_latest_active_ticket")
    try:

        response = httpx.get(
            f"{os.environ.get('BACKEND_API_URL')}/helpdesk/tickets/latest/{prospect_id}",
            headers={
                "X-Internal-Key":
                    os.environ.get("INTERNAL_API_KEY")
            },
            timeout=10
        )

        response.raise_for_status()

        raw = response.json()
        data = raw.get("data") or []
        latest_ticket = data[0] if isinstance(data, list) and data else None

        return {
            "success": raw.get("success", True),
            "exists": latest_ticket is not None,
            "data": latest_ticket,
            "message": raw.get("message")
        }

    except Exception as e:

        print(f"get_latest_active_ticket error: {e}")

        return {
            "success": False,
            "error": str(e)
        }   
