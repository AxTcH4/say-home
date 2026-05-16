package ma.sayhome.say_home_api.feedback.dto;

public record ProspectFeedbackFormResponse(
        String token,
        String prospectName,
        String contextStatus,
        String propertyTitle,
        boolean submitted
) {
}
