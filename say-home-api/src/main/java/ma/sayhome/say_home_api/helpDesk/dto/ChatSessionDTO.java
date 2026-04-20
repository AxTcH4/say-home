package ma.sayhome.say_home_api.helpDesk.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import ma.sayhome.say_home_api.helpDesk.chatMessage.ChatMessage;
import ma.sayhome.say_home_api.helpDesk.chatSession.ChatSession;
import ma.sayhome.say_home_api.prospect.Prospect;

import java.util.ArrayList;
import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "messages")
public class ChatSessionDTO {

    private Integer id;

    private Prospect prospect;

    boolean isOngoing;

    private List<ChatMessage> messages = new ArrayList<>();

    public static ChatSessionDTO toDTO(ChatSession session){
        ChatSessionDTO chatSessionDTO = new ChatSessionDTO();
        chatSessionDTO.setId(session.getId());
        chatSessionDTO.setProspect(session.getProspect());
        chatSessionDTO.setOngoing(session.isOngoing());
        chatSessionDTO.setMessages(session.getMessages());

        return chatSessionDTO;
    }
}
