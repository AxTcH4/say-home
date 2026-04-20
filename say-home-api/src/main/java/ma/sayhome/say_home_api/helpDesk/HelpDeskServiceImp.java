package ma.sayhome.say_home_api.helpDesk;

import ma.sayhome.say_home_api.auth.User;
import ma.sayhome.say_home_api.auth.UserRepository;
import ma.sayhome.say_home_api.helpDesk.chatMessage.ChatMessage;
import ma.sayhome.say_home_api.helpDesk.chatMessage.ChatMessageRepository;
import ma.sayhome.say_home_api.helpDesk.chatSession.ChatSession;
import ma.sayhome.say_home_api.helpDesk.chatSession.ChatSessionRepository;
import ma.sayhome.say_home_api.helpDesk.dto.ChatMessageRequest;
import ma.sayhome.say_home_api.helpDesk.dto.ChatSessionDTO;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.prospect.ProspectRepository;
import ma.sayhome.say_home_api.shared.enums.Sender;
import ma.sayhome.say_home_api.shared.exceptions.ForbiddenException;
import ma.sayhome.say_home_api.shared.exceptions.ResourceNotFoundException;
import ma.sayhome.say_home_api.shared.exceptions.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class HelpDeskServiceImp implements HelpDeskService {
    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private ChatSessionRepository chatSessionRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ProspectRepository prospectRepository;

    @Autowired
    private UserRepository userRepository;

    //order food (returns if order placed [boolean])
    @Override
    public boolean handleSendingMessage(User authenticatedUser, ChatMessageRequest messageRequest) {

        Prospect prospect = prospectRepository.findByUser(authenticatedUser);
        if  (prospect == null) {
            throw new ForbiddenException("Visitors are  not allowed to use chatbot ");
        }

        System.out.println("Sender is a prospect");

        messageRequest.setSender(Sender.PROSPECT);
        System.out.println("Sending message...");
        messageRequest.setSession(getOrCreateSession(prospect));
        System.out.println("About to send (ChatMessageRequest)" + messageRequest.toString());
        //save message to session
        ChatMessage message = sendProspectMessage(messageRequest);
        System.out.print("Message sent: " + message.getId() );
        getBotReply(prospect, messageRequest);
        return true;
    }

    //kitchen tools (used by bot in function calling)
    @Async
    public void getBotReply(Prospect prospect, ChatMessageRequest messageRequest) {
        System.out.println("Getting bot reply...");
        String botReply = "test bot reply"; // replace with real AI call later
        ChatMessage botMessage = sendBotMessage(messageRequest.getSession(), botReply);
        System.out.println("Bot reply: " + botReply);
        messagingTemplate.convertAndSend(
                "/topic/session/" + messageRequest.getSession().getId(),
                botMessage
        );
    }

    public ChatMessage sendBotMessage (ChatSession currentSession, String botReply) {
        System.out.println("Sending bot message...");
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setSession(currentSession);
        chatMessage.setContent(botReply);
        chatMessage.setSender(Sender.BOT);
        return chatMessageRepository.save(chatMessage);
    }

    //get sessions by userId
    public List<ChatSessionDTO> getSessionsByUserId (Integer userId) {
        Optional<User> user2Search = userRepository.findById(userId);
        if  (user2Search.isEmpty()) {
            throw new ResourceNotFoundException("User not found");
        }

        //check if user is a prospect
        Prospect prospect = prospectRepository.findByUser(user2Search.get());
        if  (prospect == null) {
            throw new ResourceNotFoundException("Visitors have no chat sessions ");
        }
        List<ChatSession> sessions = chatSessionRepository.findAllByProspect(prospect);
        List<ChatSessionDTO> results = new ArrayList<>();
        for (ChatSession session : sessions) {
            ChatSessionDTO sesh = ChatSessionDTO.toDTO(session);
            results.add(sesh);
        }

        return results;
    }

    //get All sessions
    public List<ChatSessionDTO> getAllSessions () {
        List<ChatSession> sessions = chatSessionRepository.findAll();
        List<ChatSessionDTO> results = new ArrayList<>();
        for (ChatSession session : sessions) {
            ChatSessionDTO sesh = ChatSessionDTO.toDTO(session);
            results.add(sesh);
        }

        return results;
    }

    //get sessions by user full name
    //get sessions by userId
    public List<ChatSessionDTO> getSessionsByUserFullName (String userFullName) {

        String [] name =  userFullName.split(" ");
        Optional<User> user2Search = userRepository.findUserByFirstNameAndLastName(name[0], name[1]);
        if  (user2Search.isEmpty()) {
            throw new ResourceNotFoundException("User not found");
        }

        //check if user is a prospect
        Prospect prospect = prospectRepository.findByUser(user2Search.get());
        if  (prospect == null) {
            throw new ResourceNotFoundException("Visitors have no chat sessions ");
        }
        List<ChatSession> sessions = chatSessionRepository.findAllByProspect(prospect);
        List<ChatSessionDTO> results = new ArrayList<>();
        for (ChatSession session : sessions) {
            ChatSessionDTO sesh = ChatSessionDTO.toDTO(session);
            results.add(sesh);
        }

        return results;
    }


    public ChatSessionDTO getSessionByMessageContent (String messageContent) {
        ChatSession session = chatSessionRepository.findByMessageContent(messageContent);
        if   (session == null) {
            throw new ResourceNotFoundException("Session not found");
        }
        return ChatSessionDTO.toDTO(session);
    }

    //delete by id
    public boolean deleteById(Integer id) {
        chatSessionRepository.deleteById(id);
        return true;
    }

    //-----------------------------Helpers----------------------------------
    public ChatSession getOrCreateSession (Prospect prospect) {
        //verify if there's an ongoing chatSession
        ChatSession ongoingSession =  chatSessionRepository.findByProspect(prospect);
        if (ongoingSession==null) {
            //create new session
           ChatSession sesh = chatSessionRepository.save(new ChatSession(prospect));
            System.out.print("Session created: " + sesh.getId() );

           return sesh;
        }
        System.out.print("Session exists: " + ongoingSession.getId() );
        return ongoingSession;
    }

    public ChatMessage sendProspectMessage (ChatMessageRequest messageRequest) {
        ChatMessage message = ChatMessageRequest.toEntity(messageRequest);
        return chatMessageRepository.save(
                message
        );
    }



}
