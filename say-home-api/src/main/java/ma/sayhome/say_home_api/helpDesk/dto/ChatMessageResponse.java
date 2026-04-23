package ma.sayhome.say_home_api.helpDesk.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.sayhome.say_home_api.helpDesk.chatMessage.ChatMessage;
import ma.sayhome.say_home_api.helpDesk.chatSession.ChatSession;
import ma.sayhome.say_home_api.shared.enums.Sender;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class ChatMessageResponse {
    private int id;

    private String content;

    private Sender sender;

    LocalDateTime createdAt;
//    private ChatSession session;


    public static ChatMessageResponse toDTO(ChatMessage message) {
        ChatMessageResponse chatMessageResponse = new ChatMessageResponse();
        chatMessageResponse.id = message.getId();
        chatMessageResponse.content = message.getContent();
        chatMessageResponse.sender = message.getSender();
        chatMessageResponse.createdAt = message.getCreatedAt();
        return chatMessageResponse;
    }
}
