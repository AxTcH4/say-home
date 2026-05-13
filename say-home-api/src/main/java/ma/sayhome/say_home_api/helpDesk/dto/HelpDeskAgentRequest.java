package ma.sayhome.say_home_api.helpDesk.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.sayhome.say_home_api.appointment.dto.AppointmentRequestToAgent;

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
