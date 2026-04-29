package ma.sayhome.say_home_api.prospect.dto;

public record ProspectListItemResponse(
        Integer id,
        String fullName,
        String email,
        String phone,
        String city,
        String budgetLabel,
        String status,
        Integer aiScore,
        String source,
        String assignedAgentName
) {
}
