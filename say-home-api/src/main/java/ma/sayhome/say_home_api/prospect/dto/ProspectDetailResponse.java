package ma.sayhome.say_home_api.prospect.dto;

import ma.sayhome.say_home_api.prospectProperty.dto.ProspectPropertyRecordResponse;

import java.util.List;

public record ProspectDetailResponse(
        Integer id,
        String fullName,
        String email,
        String phone,
        String city,
        String budgetLabel,
        Float budgetValue,
        String status,
        Integer aiScore,
        String source,
        String assignedAgentName,
        String projectType,
        String createdAt,
        String notes,
        String temperature,
        List<ProspectInteractionResponse> interactions,
        List<ProspectMeetingResponse> meetings,
        List<ProspectFeedbackResponse> feedback,
        List<ProspectPropertyRecordResponse> propertyRecords
) {
}
