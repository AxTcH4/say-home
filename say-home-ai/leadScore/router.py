from fastapi import APIRouter
from pydantic import BaseModel, Field

from leadScore.service import predict_prospect

router = APIRouter()


class ProspectRequest(BaseModel):

    nb_interactions: int = Field(ge=0)
    temps_site: int = Field(ge=0)
    pages_visitees: int = Field(ge=0)

    favoris_count: int = Field(ge=0)
    rdv_confirmes: int = Field(ge=0)
    messages_envoyes: int = Field(ge=0)

    budget_prospect: float = Field(ge=0)
    ecart_budget_prix: float = Field(ge=0)

    nb_negociations: int = Field(ge=0)
    dossier_complet: int = Field(ge=0)


@router.post("/predict")
def predict(data: ProspectRequest):

    result = predict_prospect(
        data.model_dump()
    )

    return result