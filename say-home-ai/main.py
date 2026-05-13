from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from matchingEngine.MatchingRouter import router as matching_engine_router
from contextlib import asynccontextmanager
import sys
from chatbot.helpers.Embedder import Embedder
import sys
from chatbot.helpers.QdrantStorage import QdrantStorage
# from leadScore.router import router as lead_score_router
from chatbot.router import router as chatbot_router
from chatbot.service import ChatbotService

@asynccontextmanager
async def lifespan(app: FastAPI):
    embedder = Embedder()
    storage = QdrantStorage()
    embedder.indexFolder("docs/", storage)

    app.state.embedder = embedder
    app.state.storage = storage
    app.state.chatbot_service = ChatbotService(embedder, storage)


    yield
    print("shutting down...")
app = FastAPI(lifespan=lifespan)
from leadScore.router import router as lead_score_router

# from chatbot.router import router as chatbot_router
from dotenv import load_dotenv

load_dotenv()



# app.include_router(lead_score_router, prefix="/lead-score")
app.include_router(chatbot_router, prefix="/chatbot")
# ======================================================
# Matching Engine
# ======================================================

app.include_router(
    matching_engine_router,
    prefix="/search"
)

# ======================================================
# Lead Score IA
# ======================================================

app.include_router(
    lead_score_router,
    prefix="/lead-score"
)

# ======================================================
# Chatbot
# ======================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(matching_engine_router, prefix="/search")


# ======================================================
# Health Check
# ======================================================

@app.get('/health')
def health():
    return {
        'status': 'ok'
    }

