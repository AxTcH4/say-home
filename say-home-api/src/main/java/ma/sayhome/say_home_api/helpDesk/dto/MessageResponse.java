package ma.sayhome.say_home_api.helpDesk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.sayhome.say_home_api.helpDesk.chatMessage.ChatMessage;
import ma.sayhome.say_home_api.helpDesk.chatSession.ChatSession;
import ma.sayhome.say_home_api.shared.enums.Sender;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageResponse {
    private Integer id;

    private boolean messageSent;

    private ChatSessionDTO session;

    public static MessageResponse toDTO(ChatMessage message) {
        MessageResponse chatMessage = new MessageResponse();
        chatMessage.setId(message.getId());

            if(message.getContent()!=null && !message.getContent().isEmpty()){
                chatMessage.setMessageSent(true);
        }
            else {
                chatMessage.setMessageSent(false);
            }
        chatMessage.setSession(ChatSessionDTO.toDTO(message.getSession()));
        return chatMessage;
    }
}
