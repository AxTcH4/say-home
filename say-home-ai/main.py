from fastapi import FastAPI
from matchingEngine.MatchingRouter import router as matching_engine_router
from contextlib import asynccontextmanager
import sys
from chatbot.helpers.Embedder import Embedder
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

app.include_router(matching_engine_router, prefix="/search")
# app.include_router(lead_score_router, prefix="/lead-score")
app.include_router(chatbot_router, prefix="/chatbot")

print(sys.executable)

@app.get('/health')
def health():
    return {'status': 'ok'}