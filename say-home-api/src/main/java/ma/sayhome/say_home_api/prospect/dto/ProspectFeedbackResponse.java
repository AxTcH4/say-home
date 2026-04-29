package ma.sayhome.say_home_api.prospect.dto;

public record ProspectFeedbackResponse(
        Integer id,
        String date,
        String satisfaction,
        String comment
) {
}
