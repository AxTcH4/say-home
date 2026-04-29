package ma.sayhome.say_home_api.appointment.dto;

import java.util.List;

public record AppointmentsBoardResponse(
        String currentRangeLabel,
        List<MeetingRequestResponse> requests,
        List<MeetingEventResponse> events
) {
}
