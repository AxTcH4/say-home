package ma.sayhome.say_home_api.appointment.dto;

public record ClientVisitRequestResponse(
        Integer id,
        Integer propertyId,
        String propertyTitle,
        String requestedDate,
        String requestedTime,
        String message,
        String requestMessage,
        String status,
        String agentName
) {
}
