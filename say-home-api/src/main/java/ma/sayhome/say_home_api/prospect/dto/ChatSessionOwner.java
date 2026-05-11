package ma.sayhome.say_home_api.prospect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.sayhome.say_home_api.user.dto.UserDTO;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.shared.enums.ProspectStatus;
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


    public static ChatSessionOwner toDTO(Prospect prospect) {
        ChatSessionOwner chatSessionOwner = new ChatSessionOwner();
        chatSessionOwner.setId(prospect.getId());
        chatSessionOwner.setUser(UserDTO.toDTO(prospect.getUser()));
        chatSessionOwner.setStatus(prospect.getStatus());

        return chatSessionOwner;
    }
}
