package ma.sayhome.say_home_api.helpDesk;

import ma.sayhome.say_home_api.auth.User;
import ma.sayhome.say_home_api.auth.UserRepository;
import ma.sayhome.say_home_api.helpDesk.chatMessage.ChatMessage;
import ma.sayhome.say_home_api.helpDesk.chatMessage.ChatMessageRepository;
import ma.sayhome.say_home_api.helpDesk.chatSession.ChatSession;
import ma.sayhome.say_home_api.helpDesk.chatSession.ChatSessionRepository;
import ma.sayhome.say_home_api.helpDesk.dto.ChatMessageRequest;
import ma.sayhome.say_home_api.helpDesk.dto.ChatMessageResponse;
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

import java.time.LocalDateTime;
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
        System.out.println("About to send message for session: " + messageRequest.getSession().getId());
        //save message to session
        ChatMessage message = sendProspectMessage(messageRequest);
        System.out.print("Message sent: " + message.getId() );

        try {
            getBotReply(prospect, messageRequest);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        return true;
    }

    //kitchen tools (used by bot in function calling)
    @Async
    public void getBotReply(Prospect prospect, ChatMessageRequest messageRequest) throws InterruptedException {
        System.out.println("Getting bot reply...");
        Thread.sleep(1500);
        String botReply = "test bot reply"; // replace with real AI call later
        ChatMessageResponse botMessage = sendBotMessage(messageRequest.getSession(), botReply);
        System.out.println("Bot reply: " + botReply);
        messagingTemplate.convertAndSend(
                "/topic/session/" + messageRequest.getSession().getId(),
                botMessage
        );
    }

    public ChatMessageResponse sendBotMessage (ChatSession currentSession, String botReply) {
        System.out.println("Sending bot message...");
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setSession(currentSession);
        chatMessage.setContent(botReply);
        chatMessage.setSender(Sender.BOT);
        return ChatMessageResponse.toDTO(chatMessageRepository.save(chatMessage));
    }
    //get active sessions by prospectId
    public ChatSessionDTO getActiveSessionsByProspectId(User authenticatedUser) {
        //check if user is prospect
        Prospect prospect = prospectRepository.findByUser(authenticatedUser);
        if  (prospect == null) {
            throw new ForbiddenException("Visitors are  not allowed to use chatbot ");
        }

        System.out.println("Request came from a prospect");

        //get active sessions

        Optional<ChatSession> resuts = chatSessionRepository.findActiveSession(prospect, LocalDateTime.now());
        //map results


        return ChatSessionDTO.toDTO(resuts.get());
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
    public ChatSession getOrCreateSession(Prospect prospect) {
        Optional<ChatSession> active = chatSessionRepository.findActiveSession(prospect, LocalDateTime.now());

        if (active.isPresent()) {
            System.out.println("Active session found: " + active.get().getId());
            return active.get();
        }

        // create new session
        ChatSession sesh = new ChatSession(prospect);
        sesh.setExpiresAt(LocalDateTime.now().plusMinutes(60));
        sesh.setOngoing(true);
        return chatSessionRepository.save(sesh);
    }

    public ChatMessage sendProspectMessage (ChatMessageRequest messageRequest) {
        ChatMessage message = ChatMessageRequest.toEntity(messageRequest);
        return chatMessageRepository.save(
                message
        );
    }



}
