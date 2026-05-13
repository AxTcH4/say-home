package ma.sayhome.say_home_api.helpDesk.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import ma.sayhome.say_home_api.helpDesk.chatMessage.ChatMessage;
import ma.sayhome.say_home_api.helpDesk.chatSession.ChatSession;
import ma.sayhome.say_home_api.prospect.dto.ChatSessionOwner;
import ma.sayhome.say_home_api.user.dto.UserDTO;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "messages")
public class ChatSessionDTO {

    private Integer id;

    private ChatSessionOwner prospect;

    private List<ChatMessageResponse> messages;

    private LocalDateTime createdAt;

    private LocalDateTime expiresAt;

    boolean isOngoing;



    public static ChatSessionDTO toDTO(ChatSession session){
        ChatSessionDTO chatSessionDTO = new ChatSessionDTO();
        chatSessionDTO.setId(session.getId());
        chatSessionDTO.setProspect(
                new ChatSessionOwner(
                        session.getProspect().getId(),
                        session.getProspect().getStatus(),
                        session.getProspect().getCity(),
                        session.getProspect().getSource(),
                        session.getProspect().getBudget(),
                        UserDTO.toDTO(session.getProspect().getUser())
                )
        );
        chatSessionDTO.setOngoing(session.isOngoing());
        List<ChatMessageResponse> chatMessages = new ArrayList<>();
        for (ChatMessage chatMessage : session.getMessages()) {
            ChatMessageResponse chatMessageResponse = ChatMessageResponse.toDTO(chatMessage);
            chatMessages.add(chatMessageResponse);
        }
        chatSessionDTO.setMessages(chatMessages);
        chatSessionDTO.setCreatedAt(session.getCreatedAt());

        return chatSessionDTO;
    }


    public static ChatSession toEntity(ChatSessionDTO sessionDTO) {
        ChatSession session = new ChatSession();
        session.setId(sessionDTO.getId());
        session.setOngoing(sessionDTO.isOngoing());
        session.setCreatedAt(sessionDTO.getCreatedAt());
        // prospect is never set → null
        return session;
    }
}
