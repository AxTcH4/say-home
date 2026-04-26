package ma.sayhome.say_home_api.helpDesk;

import ma.sayhome.say_home_api.auth.User;
import ma.sayhome.say_home_api.auth.UserRepository;
import ma.sayhome.say_home_api.helpDesk.chatMessage.ChatMessage;
import ma.sayhome.say_home_api.helpDesk.chatMessage.ChatMessageRepository;
import ma.sayhome.say_home_api.helpDesk.chatSession.ChatSession;
import ma.sayhome.say_home_api.helpDesk.chatSession.ChatSessionRepository;
import ma.sayhome.say_home_api.helpDesk.dto.*;
import ma.sayhome.say_home_api.helpDesk.ticket.Ticket;
import ma.sayhome.say_home_api.helpDesk.ticket.TicketRepository;
import ma.sayhome.say_home_api.notification.NotificationService;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.prospect.ProspectRepository;
import ma.sayhome.say_home_api.shared.enums.Role;
import ma.sayhome.say_home_api.shared.enums.Sender;
import ma.sayhome.say_home_api.shared.enums.TicketStatus;
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

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private NotificationService notificationService;

    //order food (returns if order placed [boolean])
    @Override
    public MessageResponse handleSendingMessage(User authenticatedUser, ChatMessageRequest messageRequest) {

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



        return MessageResponse.toDTO(message);
    }

    //kitchen tools (used by bot in function calling)
    @Async
    public void getBotReply(Prospect prospect, ChatMessageRequest messageRequest) throws InterruptedException {
        System.out.println("Getting bot reply...");
        Thread.sleep(1500);
        String botReply = "test bot reply"; // replace with real AI call later
        ChatMessageResponse botMessage = sendBotMessage(messageRequest.getSession(), botReply);
        System.out.println("Bot reply: " + botReply);
        String msg = "You got a reply: " + botReply;
        notificationService.createNotification(msg , prospect.getUser());
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

        ChatSession resuts = chatSessionRepository.findActiveSession(prospect, LocalDateTime.now())
                .orElseThrow(() -> new ResourceNotFoundException("Not found"));;
        //map results


        return ChatSessionDTO.toDTO(resuts);
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


//    ----------------------TICKETS----------------------------
// create ticket
public TicketDTO createTicket(User authenticatedUser, TicketRequest ticketRequest) {
    Prospect prospect = prospectRepository.findByUser(authenticatedUser);
    if (prospect == null) {
        throw new ForbiddenException("Visitors are not allowed to create tickets");
    }

    Ticket ticket = new Ticket();
    ticket.setTitle(ticketRequest.getTitle());
    ticket.setDescription(ticketRequest.getDescription());
    ticket.setStatus(TicketStatus.OPEN);
    ticket.setProspect(prospect);
    ticket.setUpdatedAt(LocalDateTime.now());
    ticket.setPriority(ticketRequest.getPriority());
    TicketDTO ticketDTO = TicketDTO.toDTO(ticketRepository.save(ticket));
    //send notification
    notificationService.createNotificationsForRole(" A ticket just got created by " +  ticketDTO.getProspect().getUser().getFirstName(), Role.ADMIN);

    return ticketDTO;
}

    // get all tickets
    public List<TicketDTO> getAllTickets() {
        List<Ticket> tickets = ticketRepository.findAll();
        List<TicketDTO> results = new ArrayList<>();
        for (Ticket ticket : tickets) {
            results.add(TicketDTO.toDTO(ticket));
        }
        return results;
    }

    // get tickets by prospectId
    public List<TicketDTO> getTicketsByProspectId(Integer prospectId) {
        Prospect prospect = prospectRepository.findById(prospectId)
                .orElseThrow(() -> new ResourceNotFoundException("Prospect not found"));
        List<Ticket> tickets = ticketRepository.findAllByProspect(prospect);
        List<TicketDTO> results = new ArrayList<>();
        for (Ticket ticket : tickets) {
            results.add(TicketDTO.toDTO(ticket));
        }
        return results;
    }

    // get tickets by prospect name
    public List<TicketDTO> getTicketsByProspectName(String prospectName) {
        String[] name  =  prospectName.split(" ");
        Optional<User> user2Search = userRepository.findUserByFirstNameAndLastName(name[0], name[1]);
        if  (user2Search.isEmpty()) {
            throw new ResourceNotFoundException("User not found");
        }

        //check if user is a prospect
        Prospect prospect = prospectRepository.findByUser(user2Search.get());
        if  (prospect == null) {
            throw new ResourceNotFoundException("Visitors have no chat sessions ");
        }
        List<Ticket> tickets = ticketRepository.findAllByProspect(prospect);
        List<TicketDTO> results = new ArrayList<>();
        for (Ticket ticket : tickets) {
            results.add(TicketDTO.toDTO(ticket));
        }
        return results;
    }

    // get tickets by status
    public List<TicketDTO> getTicketsByStatus(TicketStatus status) {
        List<Ticket> tickets = ticketRepository.findAllByStatus(status);
        List<TicketDTO> results = new ArrayList<>();
        for (Ticket ticket : tickets) {
            results.add(TicketDTO.toDTO(ticket));
        }
        return results;
    }

    // get ticket by title
    public TicketDTO getTicketByTitle(String title) {
        Ticket ticket = ticketRepository.findByTitle(title)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        return TicketDTO.toDTO(ticket);
    }

    // update ticket
    public TicketDTO updateTicket(Integer ticketId, TicketRequest ticketRequest) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        ticket.setTitle(ticketRequest.getTitle());
        ticket.setDescription(ticketRequest.getDescription());
        ticket.setStatus(ticketRequest.getStatus());
        ticket.setPriority(ticketRequest.getPriority());
        ticket.setUpdatedAt(LocalDateTime.now());
        TicketDTO ticketDTO = TicketDTO.toDTO(ticketRepository.save(ticket));
        notificationService.createNotificationsForRole("The ticket " + ticket.getId()  + " was updated to " + ticketDTO.getStatus() , Role.ADMIN);
        return ticketDTO;
    }

    // delete ticket
    public boolean deleteTicketById(Integer ticketId) {
        ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        ticketRepository.deleteById(ticketId);
        return true;
    }

}
