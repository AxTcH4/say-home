package ma.sayhome.say_home_api.appointment.dto;

public record MeetingRequestResponse(
        Integer id,
        Integer prospectId,
        String prospectName,
        String city,
        String budgetLabel,
        String requestedDate,
        String requestedTime,
        String message,
        Integer propertyId,
        String propertyTitle,
        String status
) {
}
