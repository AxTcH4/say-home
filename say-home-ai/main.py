from fastapi import FastAPI
from matchingEngine.router import router as matching_engine_router
from leadScore.router import router as lead_score_router
from chatbot.router import router as chatbot_router

app = FastAPI()

app.include_router(matching_engine_router, prefix="/search")
app.include_router(lead_score_router, prefix="/lead-score")
app.include_router(chatbot_router, prefix="/chatbot")

@app.get('/health')
def health():
    return {'status': 'ok'}