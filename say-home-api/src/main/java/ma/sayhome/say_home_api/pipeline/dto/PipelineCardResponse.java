package ma.sayhome.say_home_api.pipeline.dto;

public record PipelineCardResponse(
        Integer id,
        String fullName,
        String city,
        String budgetLabel,
        Integer aiScore,
        String assignedAgentName,
        String status
) {
}
