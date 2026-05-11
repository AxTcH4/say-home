package ma.sayhome.say_home_api.helpDesk.chat;

import ma.sayhome.say_home_api.helpDesk.chat.dto.ChatMessageRequest;
import ma.sayhome.say_home_api.helpDesk.chat.dto.ChatSessionDTO;
import ma.sayhome.say_home_api.helpDesk.chat.dto.MessageResponse;
import ma.sayhome.say_home_api.user.User;

import java.util.List;

public interface ChatService {
    MessageResponse handleSendingMessage(User authUser, ChatMessageRequest messageRequest);
    ChatSessionDTO getActiveSessionsByProspectId(User authenticatedUser);
    List<ChatSessionDTO> getSessionsByUserId(Integer userId);
    List<ChatSessionDTO> getAllSessions();
    List<ChatSessionDTO> getSessionsByUserFullName(String userFullName);
    ChatSessionDTO getSessionByMessageContent(String messageContent);
    boolean deleteById(Integer id);
}
