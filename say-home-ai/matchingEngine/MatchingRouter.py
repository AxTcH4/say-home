from fastapi import APIRouter, Query
from matchingEngine.MatchingService import MatchingService
from matchingEngine.RetrainService import RetrainService

router = APIRouter()
matchingService = MatchingService()
retrainService = RetrainService()


@router.get("/match")
def match(
    query: str = Query(default=None),
    type: str = Query(default=None),
    secteur: str = Query(default=None),
    minPrice: float = Query(default=None),
    maxPrice: float = Query(default=None),
    minSurface: float = Query(default=None),
    minRooms: float = Query(default=None),
):

    return matchingService.match(query, type, secteur, minPrice, maxPrice, minSurface, minRooms)


@router.post("/retrain")
def retrain():
    return retrainService.retrain()
