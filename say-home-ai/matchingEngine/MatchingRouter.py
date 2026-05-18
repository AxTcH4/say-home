from fastapi import APIRouter, Query
from pydantic import Field
from matchingEngine.MatchingService import MatchingService
from matchingEngine.RetrainService import RetrainService

router = APIRouter()
matchingService = MatchingService()
retrainService = RetrainService()


@router.get("/match")
def match(
    query: str = Query(default=None, max_length=500),
    type: str = Query(default=None, max_length=100),
    secteur: str = Query(default=None, max_length=100),
    minPrice: float = Query(default=None, ge=0),
    maxPrice: float = Query(default=None, ge=0),
    minSurface: float = Query(default=None, ge=0),
    minRooms: float = Query(default=None, ge=0),
):

    return matchingService.match(query, type, secteur, minPrice, maxPrice, minSurface, minRooms)


@router.post("/retrain")
def retrain():
    return retrainService.retrain()
