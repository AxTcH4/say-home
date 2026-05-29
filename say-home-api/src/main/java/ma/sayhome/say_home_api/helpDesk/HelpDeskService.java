package ma.sayhome.say_home_api.helpDesk;

import ma.sayhome.say_home_api.user.User;
import ma.sayhome.say_home_api.helpDesk.chatMessage.ChatMessage;
import ma.sayhome.say_home_api.helpDesk.chatSession.ChatSession;
import ma.sayhome.say_home_api.helpDesk.dto.ChatMessageRequest;
import ma.sayhome.say_home_api.helpDesk.dto.MessageResponse;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.user.User;

public interface HelpDeskService {


    MessageResponse handleSendingMessage(ma.sayhome.say_home_api.user.User authenticatedUser, ChatMessageRequest messageRequest);
}
