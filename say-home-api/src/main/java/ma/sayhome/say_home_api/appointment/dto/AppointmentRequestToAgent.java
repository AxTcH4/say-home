package ma.sayhome.say_home_api.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.sayhome.say_home_api.appointment.Appointment;
import ma.sayhome.say_home_api.property.dto.PropertyDTO;
import ma.sayhome.say_home_api.shared.enums.AppointmentStatus;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentRequestToAgent {

    private Integer id;

    private Integer agentId;
    private String agentName;

    private PropertyDTO property;

    private String date;

    private String meetingType;

    private String notes;

    private AppointmentStatus status;


    public static AppointmentRequestToAgent toDTO(Appointment apt) {
        AppointmentRequestToAgent aptRequest = new AppointmentRequestToAgent();
        aptRequest.setId(apt.getId());

        if (apt.getAgent() != null) {
            aptRequest.setAgentId(apt.getAgent().getId());
            aptRequest.setAgentName(apt.getAgent().getFullName());
        }

        aptRequest.setDate(apt.getDate().toString());
        aptRequest.setMeetingType(apt.getMeetingType());
        aptRequest.setNotes(apt.getNotes());
        aptRequest.setProperty(PropertyDTO.toDTO(apt.getProperty()));
        aptRequest.setStatus(apt.getStatus());
        return aptRequest;
    }
}
