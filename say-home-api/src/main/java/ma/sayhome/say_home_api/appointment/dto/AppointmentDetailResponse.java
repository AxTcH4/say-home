package ma.sayhome.say_home_api.appointment.dto;

public record AppointmentDetailResponse(
        Integer id,
        Integer prospectId,
        String prospectName,
        Integer agentId,
        String agentName,
        Integer propertyId,
        String date,
        String time,
        String meetingType,
        String notes,
        String status
) {
}
