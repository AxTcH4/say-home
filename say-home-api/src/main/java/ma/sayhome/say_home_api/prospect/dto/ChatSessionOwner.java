package ma.sayhome.say_home_api.prospect.dto;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import ma.sayhome.say_home_api.appointment.Appointment;
import ma.sayhome.say_home_api.auth.dto.UserDTO;
import ma.sayhome.say_home_api.helpDesk.chatSession.ChatSession;
import ma.sayhome.say_home_api.helpDesk.ticket.Ticket;
import ma.sayhome.say_home_api.leadScore.LeadScore;
import ma.sayhome.say_home_api.matchingEngine.matchRun.MatchRun;
import ma.sayhome.say_home_api.pipeline.PipelineStage;
import ma.sayhome.say_home_api.shared.enums.ProspectStatus;

import java.util.ArrayList;
import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatSessionOwner {
    private Integer id;

    private ProspectStatus status = ProspectStatus.NEW;

    private UserDTO user;

//    private PipelineStage stage;

//    private List<Appointment> appointments = new ArrayList<>();

//    private List<Ticket> tickets = new ArrayList<>();

//    private List<ChatSession> chatSessions = new ArrayList<>();

//    private List<LeadScore> leadScores = new ArrayList<>();

//    private List<MatchRun> matchRuns = new ArrayList<>();
}
