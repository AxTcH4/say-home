from fastapi import APIRouter, Query
from matchingEngine.MatchingService import MatchingService

router = APIRouter()
matchingService = MatchingService()

@router.get("/match")
def match(
    query: str = Query(default=None),
    type: str = Query(default=None),
    secteur: str = Query(default=None),
    minPrice: float = Query(default=None),
    maxPrice: float = Query(default=None),
    minSurface: float = Query(default=None),
    minRooms: float = Query(default=None)
):

    return matchingService.match(query, type, secteur, minPrice, maxPrice, minSurface, minRooms)
