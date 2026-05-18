package ma.sayhome.say_home_api.helpDesk;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import ma.sayhome.say_home_api.appointment.Appointment;
import ma.sayhome.say_home_api.appointment.dto.AppointmentRequestToAgent;
import ma.sayhome.say_home_api.user.User;
import ma.sayhome.say_home_api.user.UserRepository;
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
import ma.sayhome.say_home_api.prospectProperty.ProspectPropertyRecord;
import ma.sayhome.say_home_api.prospectProperty.ProspectPropertyRecordRepository;
import ma.sayhome.say_home_api.shared.enums.ProspectPropertyStatus;
import ma.sayhome.say_home_api.shared.enums.Role;
import ma.sayhome.say_home_api.shared.enums.Sender;
import ma.sayhome.say_home_api.shared.enums.TicketStatus;
import ma.sayhome.say_home_api.shared.exceptions.BadRequestException;
import ma.sayhome.say_home_api.shared.exceptions.ForbiddenException;
import ma.sayhome.say_home_api.shared.exceptions.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class HelpDeskServiceImp implements HelpDeskService {
    private static final Logger LOGGER = LoggerFactory.getLogger(HelpDeskServiceImp.class);

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

    @Autowired
    private ProspectPropertyRecordRepository prospectPropertyRecordRepository;

    @Value("${ai.server.url}")
    private String aiServerUrl;

    private final JavaMailSender mailSender;

    public HelpDeskServiceImp(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Value("${spring.mail.username}")
    private String SAY_HOME_EMAIL;

    private final RestClient restClient = RestClient.create();

    @Override
    public MessageResponse handleSendingMessage(User authenticatedUser, ChatMessageRequest messageRequest) {

        Prospect prospect = prospectRepository.findByUser(authenticatedUser);
        if  (prospect == null) {
            throw new ForbiddenException("Visitors are  not allowed to use chatbot ");
        }
        System.out.println("Sender is a prospect");

        messageRequest.setSender(Sender.PROSPECT);

        System.out.println("Sending message...");
        ChatSession currentSession = getOrCreateSession(prospect);
        messageRequest.setSession(ChatSessionDTO.toDTO(currentSession));
        HelpDeskAgentRequest agentRequest = new HelpDeskAgentRequest();

        if (messageRequest.getSession().getMessages().isEmpty()) {
//            session is new: pass the init data to fastAPI
//                agentRequest.setProspectId(prospect.getId());
//                agentRequest.setCity(prospect.getCity());
//                agentRequest.setSource(prospect.getSource());
//                agentRequest.setBudget(prospect.getBudget());
//                agentRequest.setUser(UserDTO.toDTO(prospect.getUser()));
                List <AppointmentRequestToAgent> aptsToAgent = new ArrayList<>();
                for (Appointment apt : prospect.getAppointments()) {
                    AppointmentRequestToAgent aptRequest = AppointmentRequestToAgent.toDTO(apt);
                    aptsToAgent.add(aptRequest);
                }
                agentRequest.setAppointments(aptsToAgent);
                agentRequest.setOwnedProperties(
                        prospectPropertyRecordRepository.findByProspectIdOrderByUpdatedAtDesc(prospect.getId()).stream()
                                .filter(record -> record.getStatus() == ProspectPropertyStatus.BOUGHT
                                        || record.getStatus() == ProspectPropertyStatus.RENTED)
                                .map(this::toOwnedPropertyContext)
                                .toList()
                );
        }

        agentRequest.setMessageRequest(messageRequest);
//        agentRequest.setSessionId(messageRequest.getSession().getId());

        System.out.println("About to send message for session: " + messageRequest.getSession().getId());
        //save message to session
        ChatMessage message = sendProspectMessage(messageRequest, currentSession);
        currentSession.setExpiresAt(LocalDateTime.now().plusMinutes(30));
        chatSessionRepository.save(currentSession);
        System.out.print("Message sent: " + message.getId() );

        try {
            getBotReply(prospect, agentRequest, currentSession);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            LOGGER.warn("Chatbot reply retrieval was interrupted for session {}", currentSession.getId(), exception);
        } catch (Exception exception) {
            LOGGER.error("Failed to retrieve chatbot reply for session {}", currentSession.getId(), exception);
        }

        return MessageResponse.toDTO(message);
    }

    private OwnedPropertyContextDTO toOwnedPropertyContext(ProspectPropertyRecord record) {
        return new OwnedPropertyContextDTO(
                record.getId(),
                record.getProperty() != null ? record.getProperty().getId() : null,
                record.getProperty() != null ? record.getProperty().getTitle() : null,
                record.getProperty() != null && record.getProperty().getSecteur() != null ? record.getProperty().getSecteur().name() : null,
                record.getProperty() != null && record.getProperty().getType() != null ? record.getProperty().getType().name() : null,
                record.getStatus() != null ? record.getStatus().name() : null
        );
    }

//    @Async
    public void getBotReply(Prospect prospect, HelpDeskAgentRequest agentRequest, ChatSession currentSession) throws InterruptedException {

        try {
        System.out.println("Getting bot reply...");

        String url = aiServerUrl + "/chatbot/reply";

        System.out.println("Agent Request: " + agentRequest.toString());
        System.out.println("Sending request to endpoint: " + url);

        String res = restClient.post(
                )
                .uri(url)
                .body(agentRequest)
                .contentType(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(String.class);

        System.out.println("ROW JSON: " + res);

        ObjectMapper mapper = new ObjectMapper();
        AgentAnswer botReply  = mapper.readValue(res, AgentAnswer.class);


            ChatMessageResponse botMessage = sendBotMessage(currentSession, botReply.getContent().trim());
            System.out.println("Bot reply: " + botReply);
            String replyPreview = botReply.getContent().length() > 100
                    ? botReply.getContent().substring(0, 100) + "..."
                    : botReply.getContent();
            String msg = "Nouveau message: " + replyPreview;
            notificationService.createNotification(msg , prospect.getUser());
            messagingTemplate.convertAndSend(
                    "/topic/session/" + currentSession.getId(),  // use currentSession directly
                    botMessage
            );
        } catch (Exception exception) {
            LOGGER.error("Failed to get bot reply for session {}", currentSession.getId(), exception);
        }
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

    public ChatMessage sendProspectMessage(ChatMessageRequest messageRequest, ChatSession currentSession) {
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setContent(messageRequest.getContent());
        chatMessage.setSender(messageRequest.getSender());
        chatMessage.setSession(currentSession);  // real session, not converted
        return chatMessageRepository.save(chatMessage);
    }


//    ----------------------TICKETS----------------------------
// create ticket
    public TicketDTO createTicket(TicketRequest ticketRequest) {
//        check if prospect id s valid
        System.out.println("In create ticket...");
    Prospect prospect = prospectRepository.findById(ticketRequest.getProspectId())
                                            .orElseThrow(()->new ResourceNotFoundException("Prospect not found")
    );

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

    public List<TicketDTO> getTicketsByAuthenticatedProspect(User authenticatedUser) {
        Prospect prospect = prospectRepository.findByUser(authenticatedUser);
        if (prospect == null) {
            throw new ResourceNotFoundException("Prospect not found for authenticated user");
        }

        List<TicketDTO> results = new ArrayList<>();
        for (Ticket ticket : ticketRepository.findAllByProspect(prospect)) {
            results.add(TicketDTO.toDTO(ticket));
        }
        return results;
    }


    //get lastest  active tickets by prospectId
    public List<TicketDTO> getLatestActiveTicketsByProspectId(Integer prospectId) {

        Prospect prospect = prospectRepository.findById(prospectId)
                .orElseThrow(() -> new ResourceNotFoundException("Prospect not found"));

        LocalDateTime limit =
                LocalDateTime.now().minusHours(1);

        List<Ticket> tickets = ticketRepository.findFirstByProspectAndStatusNotAndCreatedAtAfterOrderByCreatedAtDesc(prospect, limit);
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

    public boolean sendComfirmationEmail(String email, String subject, String greeting, String body, String footnote ) {

        try {
            sendHtmlEmail(
                    email,
                    subject,
                    buildConfirmationEmail(
                            greeting,
                            body,
                            footnote
                    )
            );

            return true;
        } catch (MailException | MessagingException ex) {
            throw new BadRequestException("Unable to send comfirmation email");
        }
    }

    private void sendHtmlEmail(String to, String subject, String html) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
        helper.setFrom(SAY_HOME_EMAIL);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        mailSender.send(message);
    }

    private String buildConfirmationEmail(String greeting, String body, String footnote) {
        return """
            <!doctype html>
            <html>
              <body style="margin:0;padding:0;background:#f5f5f3;font-family:Arial,Helvetica,sans-serif;color:#222222;">
                <table role="presentation" width="100%%">
                  <tr>
                    <td align="center">
                      <table role="presentation" width="100%%" style="max-width:620px;background:#ffffff;border:1px solid #e3ded8;">
                        <tr>
                          <td style="background:#2f1b10;padding:28px 32px;text-align:center;">
                            <div style="font-size:26px;font-weight:800;color:#ffffff;text-transform:uppercase;">Say Home</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:36px 34px 28px 34px;">
                            <p style="font-size:16px;color:#333333;">%s</p>
                            <p style="font-size:15px;color:#555555;">%s</p>
                            <p style="font-size:13px;color:#777777;">%s</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="background:#f1eee9;padding:18px 32px;text-align:center;font-size:12px;color:#777777;">
                            Marrakech, Maroc - sayhome.app@gmail.com
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
            """.formatted(greeting, body, footnote);
    }
}
