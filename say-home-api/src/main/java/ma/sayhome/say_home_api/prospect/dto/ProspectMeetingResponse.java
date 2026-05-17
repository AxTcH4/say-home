package ma.sayhome.say_home_api.prospect.dto;

public record ProspectMeetingResponse(
        Integer id,
        Integer propertyId,
        String type,
        String date,
        String time,
        String status,
        String propertyTitle,
        String outcome
) {
}
