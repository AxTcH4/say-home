package ma.sayhome.say_home_api.leadScore.dto;

public record LeadScoreAiRequest(
        int nb_interactions,
        int temps_site,
        int pages_visitees,
        int favoris_count,
        int rdv_confirmes,
        int messages_envoyes,
        float budget_prospect,
        float ecart_budget_prix,
        int nb_negociations,
        int dossier_complet
) {
}
