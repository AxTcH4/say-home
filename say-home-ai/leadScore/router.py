from fastapi import APIRouter
from pydantic import BaseModel

from leadScore.service import predict_prospect

router = APIRouter()


class ProspectRequest(BaseModel):

    nb_interactions: int
    temps_site: int
    pages_visitees: int

    favoris_count: int
    rdv_confirmes: int
    messages_envoyes: int

    budget_prospect: float
    ecart_budget_prix: float

    nb_negociations: int
    dossier_complet: int


@router.post("/predict")
def predict(data: ProspectRequest):

    result = predict_prospect(
        data.dict()
    )

    return result