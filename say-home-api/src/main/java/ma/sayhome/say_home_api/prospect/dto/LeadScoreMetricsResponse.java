package ma.sayhome.say_home_api.prospect.dto;

public record LeadScoreMetricsResponse(
        Integer score,
        String classification,
        Integer totalInteractions,
        Integer propertyRelations,
        Integer favoriteCount,
        Integer confirmedMeetings,
        Integer totalMeetings,
        Integer messagesCount,
        Integer negotiationCount,
        Integer completeDossierCount,
        Float budget,
        Float budgetGap
) {
}
