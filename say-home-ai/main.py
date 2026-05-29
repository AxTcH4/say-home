from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from matchingEngine.MatchingRouter import router as matching_engine_router
from contextlib import asynccontextmanager
from chatbot.helpers.Embedder import Embedder
from chatbot.helpers.QdrantStorage import QdrantStorage
from leadScore.router import router as lead_score_router
from chatbot.router import router as chatbot_router
from chatbot.service import ChatbotService
from dotenv import load_dotenv
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        logger.info("Initializing embedder and storage...")
        embedder = Embedder()
        storage = QdrantStorage()

        if not os.path.exists("docs/"):
            logger.warning("docs/ directory not found, skipping indexing")
            app.state.embedder = embedder
            app.state.storage = storage
            app.state.chatbot_service = ChatbotService(embedder, storage)
        else:
            logger.info("Indexing documentation...")
            embedder.indexFolder("docs/", storage)
            app.state.embedder = embedder
            app.state.storage = storage
            app.state.chatbot_service = ChatbotService(embedder, storage)
            logger.info("Initialization complete")
    except Exception as e:
        logger.error(f"Failed to initialize app resources: {e}")
        raise

    yield

    try:
        logger.info("Shutting down...")
        # Add cleanup code here if needed
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")

app = FastAPI(lifespan=lifespan)

# ======================================================
# CORS Middleware
# ======================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

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

app.include_router(
    chatbot_router,
    prefix="/chatbot"
)

# ======================================================
# Health Check
# ======================================================

@app.get('/health')
def health():
    return {
        'status': 'ok'
    }
