package ma.sayhome.say_home_api.helpDesk.dto;

import jakarta.persistence.CascadeType;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.sayhome.say_home_api.appointment.Appointment;
import ma.sayhome.say_home_api.appointment.dto.AppointmentRequestToAgent;
import ma.sayhome.say_home_api.auth.dto.UserDTO;
import ma.sayhome.say_home_api.leadScore.LeadScore;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.shared.enums.ProspectStatus;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HelpDeskAgentRequest {

//    private int prospectId;
//
//    private UserDTO user;


//    private int sessionId;

//    private ProspectStatus prospectStatus;

    private List<AppointmentRequestToAgent> appointments = new ArrayList<>();

    private ChatMessageRequest messageRequest;

//    private List<LeadScore> leadScores = new ArrayList<>();



}
