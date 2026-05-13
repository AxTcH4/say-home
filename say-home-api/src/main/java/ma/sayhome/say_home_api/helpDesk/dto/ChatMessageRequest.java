package ma.sayhome.say_home_api.helpDesk.dto;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import ma.sayhome.say_home_api.helpDesk.chatMessage.ChatMessage;
import ma.sayhome.say_home_api.helpDesk.chatSession.ChatSession;
import ma.sayhome.say_home_api.shared.EntityBase;
import ma.sayhome.say_home_api.shared.enums.Sender;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "session")

public class ChatMessageRequest {

//        private Integer id;

        @NotBlank
        @Size(max = 2000)
        private String content;

        private Sender sender; // "agent" or "prospect"

        private ChatSessionDTO session;

    public static ChatMessage toEntity(ChatMessageRequest messageRequest) {
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setContent(messageRequest.getContent());
        chatMessage.setSender(messageRequest.getSender());
        chatMessage.setSession(ChatSessionDTO.toEntity(messageRequest.getSession()));
        return chatMessage;
    }
}


