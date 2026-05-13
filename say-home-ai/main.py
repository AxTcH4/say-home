from fastapi import FastAPI
from matchingEngine.MatchingRouter import router as matching_engine_router
from leadScore.router import router as lead_score_router

# from chatbot.router import router as chatbot_router

import sys

app = FastAPI()

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

# app.include_router(
#     chatbot_router,
#     prefix="/chatbot"
# )

print(sys.executable)

# ======================================================
# Health Check
# ======================================================

@app.get('/health')
def health():
    return {
        'status': 'ok'
    }