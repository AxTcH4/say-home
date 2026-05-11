package ma.sayhome.say_home_api.helpDesk.chat;

import ma.sayhome.say_home_api.helpDesk.chat.dto.ChatMessageRequest;
import ma.sayhome.say_home_api.helpDesk.chat.dto.ChatMessageResponse;
import ma.sayhome.say_home_api.helpDesk.chat.dto.ChatSessionDTO;
import ma.sayhome.say_home_api.helpDesk.chat.dto.MessageResponse;
import ma.sayhome.say_home_api.helpDesk.chat.message.ChatMessage;
import ma.sayhome.say_home_api.helpDesk.chat.message.ChatMessageRepository;
import ma.sayhome.say_home_api.helpDesk.chat.session.ChatSession;
import ma.sayhome.say_home_api.helpDesk.chat.session.ChatSessionRepository;
import ma.sayhome.say_home_api.notification.NotificationService;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.prospect.ProspectRepository;
import ma.sayhome.say_home_api.shared.enums.Sender;
import ma.sayhome.say_home_api.shared.exceptions.ForbiddenException;
import ma.sayhome.say_home_api.shared.exceptions.ResourceNotFoundException;
import ma.sayhome.say_home_api.user.User;
import ma.sayhome.say_home_api.user.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ChatServiceImpl implements ChatService {
    private final ChatMessageRepository chatMessageRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ProspectRepository prospectRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ChatServiceImpl(
            ChatMessageRepository chatMessageRepository,
            ChatSessionRepository chatSessionRepository,
            SimpMessagingTemplate messagingTemplate,
            ProspectRepository prospectRepository,
            UserRepository userRepository,
            NotificationService notificationService
    ) {
        this.chatMessageRepository = chatMessageRepository;
        this.chatSessionRepository = chatSessionRepository;
        this.messagingTemplate = messagingTemplate;
        this.prospectRepository = prospectRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Override
    public MessageResponse handleSendingMessage(User authenticatedUser, ChatMessageRequest messageRequest) {
        Prospect prospect = prospectRepository.findByUser(authenticatedUser);
        if (prospect == null) {
            throw new ForbiddenException("Visitors are  not allowed to use chatbot ");
        }

        messageRequest.setSender(Sender.PROSPECT);
        messageRequest.setSession(getOrCreateSession(prospect));
        ChatMessage message = sendProspectMessage(messageRequest);

        try {
            getBotReply(prospect, messageRequest);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }

        return MessageResponse.toDTO(message);
    }

    @Async
    public void getBotReply(Prospect prospect, ChatMessageRequest messageRequest) throws InterruptedException {
        Thread.sleep(1500);
        String botReply = "test bot reply";
        ChatMessageResponse botMessage = sendBotMessage(messageRequest.getSession(), botReply);
        String msg = "You got a reply: " + botReply;
        notificationService.createNotification(msg, prospect.getUser());
        messagingTemplate.convertAndSend("/topic/session/" + messageRequest.getSession().getId(), botMessage);
    }

    public ChatMessageResponse sendBotMessage(ChatSession currentSession, String botReply) {
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setSession(currentSession);
        chatMessage.setContent(botReply);
        chatMessage.setSender(Sender.BOT);
        return ChatMessageResponse.toDTO(chatMessageRepository.save(chatMessage));
    }

    @Override
    public ChatSessionDTO getActiveSessionsByProspectId(User authenticatedUser) {
        Prospect prospect = prospectRepository.findByUser(authenticatedUser);
        if (prospect == null) {
            throw new ForbiddenException("Visitors are  not allowed to use chatbot ");
        }

        ChatSession results = chatSessionRepository.findActiveSession(prospect, LocalDateTime.now())
                .orElseThrow(() -> new ResourceNotFoundException("Not found"));

        return ChatSessionDTO.toDTO(results);
    }

    @Override
    public List<ChatSessionDTO> getSessionsByUserId(Integer userId) {
        Optional<User> userToSearch = userRepository.findById(userId);
        if (userToSearch.isEmpty()) {
            throw new ResourceNotFoundException("User not found");
        }

        Prospect prospect = prospectRepository.findByUser(userToSearch.get());
        if (prospect == null) {
            throw new ResourceNotFoundException("Visitors have no chat sessions ");
        }

        List<ChatSessionDTO> results = new ArrayList<>();
        for (ChatSession session : chatSessionRepository.findAllByProspect(prospect)) {
            results.add(ChatSessionDTO.toDTO(session));
        }
        return results;
    }

    @Override
    public List<ChatSessionDTO> getAllSessions() {
        List<ChatSessionDTO> results = new ArrayList<>();
        for (ChatSession session : chatSessionRepository.findAll()) {
            results.add(ChatSessionDTO.toDTO(session));
        }
        return results;
    }

    @Override
    public List<ChatSessionDTO> getSessionsByUserFullName(String userFullName) {
        String[] name = userFullName.split(" ");
        Optional<User> userToSearch = userRepository.findUserByFirstNameAndLastName(name[0], name[1]);
        if (userToSearch.isEmpty()) {
            throw new ResourceNotFoundException("User not found");
        }

        Prospect prospect = prospectRepository.findByUser(userToSearch.get());
        if (prospect == null) {
            throw new ResourceNotFoundException("Visitors have no chat sessions ");
        }

        List<ChatSessionDTO> results = new ArrayList<>();
        for (ChatSession session : chatSessionRepository.findAllByProspect(prospect)) {
            results.add(ChatSessionDTO.toDTO(session));
        }
        return results;
    }

    @Override
    public ChatSessionDTO getSessionByMessageContent(String messageContent) {
        ChatSession session = chatSessionRepository.findByMessageContent(messageContent);
        if (session == null) {
            throw new ResourceNotFoundException("Session not found");
        }
        return ChatSessionDTO.toDTO(session);
    }

    @Override
    public boolean deleteById(Integer id) {
        chatSessionRepository.deleteById(id);
        return true;
    }

    public ChatSession getOrCreateSession(Prospect prospect) {
        Optional<ChatSession> active = chatSessionRepository.findActiveSession(prospect, LocalDateTime.now());
        if (active.isPresent()) {
            return active.get();
        }

        ChatSession session = new ChatSession(prospect);
        session.setExpiresAt(LocalDateTime.now().plusMinutes(60));
        session.setOngoing(true);
        return chatSessionRepository.save(session);
    }

    public ChatMessage sendProspectMessage(ChatMessageRequest messageRequest) {
        return chatMessageRepository.save(ChatMessageRequest.toEntity(messageRequest));
    }
}
