package ma.sayhome.say_home_api.helpDesk;

import ma.sayhome.say_home_api.auth.User;
import ma.sayhome.say_home_api.helpDesk.chatMessage.ChatMessage;
import ma.sayhome.say_home_api.helpDesk.chatSession.ChatSession;
import ma.sayhome.say_home_api.helpDesk.dto.ChatMessageRequest;
import ma.sayhome.say_home_api.prospect.Prospect;

public interface HelpDeskService {

    boolean handleSendingMessage (User authUser, ChatMessageRequest messageRequest);
}
