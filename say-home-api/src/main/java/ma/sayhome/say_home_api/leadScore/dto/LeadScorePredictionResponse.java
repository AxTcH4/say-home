package ma.sayhome.say_home_api.leadScore.dto;

import java.util.Map;

public record LeadScorePredictionResponse(
        Integer prospectId,
        Float score,
        String classification,
        Map<String, Float> breakdown,
        boolean persisted
) {
}
