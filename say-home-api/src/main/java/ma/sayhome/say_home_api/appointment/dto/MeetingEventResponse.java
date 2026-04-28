package ma.sayhome.say_home_api.appointment.dto;

public record MeetingEventResponse(
        Integer id,
        Integer prospectId,
        String title,
        String agentName,
        String location,
        String type,
        String status,
        String dayLabel,
        String date,
        String startTime,
        String endTime,
        String color
) {
}
