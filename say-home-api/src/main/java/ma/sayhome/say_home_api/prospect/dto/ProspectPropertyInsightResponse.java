package ma.sayhome.say_home_api.prospect.dto;

public record ProspectPropertyInsightResponse(
        Integer propertyId,
        String propertyTitle,
        String relationStatus,
        Integer totalInteractions,
        Integer favoriteCount,
        Integer visitRequestedCount,
        Integer visitCompletedCount,
        Integer negotiationCount,
        Integer documentCount,
        Integer requestMeetingsCount,
        Integer confirmedMeetingsCount,
        Integer completedMeetingsCount,
        String lastUpdatedAt
) {
}
