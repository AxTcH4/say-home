package ma.sayhome.say_home_api.helpDesk;

import jakarta.validation.Valid;
import ma.sayhome.say_home_api.auth.User;
import ma.sayhome.say_home_api.helpDesk.dto.ChatMessageRequest;
import ma.sayhome.say_home_api.helpDesk.dto.TicketRequest;
import ma.sayhome.say_home_api.helpDesk.dto.ChatSessionDTO;
import ma.sayhome.say_home_api.helpDesk.dto.TicketDTO;

import ma.sayhome.say_home_api.shared.ApiResponse;
import ma.sayhome.say_home_api.shared.ControllerBase;
import ma.sayhome.say_home_api.shared.enums.TicketStatus;
import ma.sayhome.say_home_api.shared.exceptions.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/helpdesk")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class HelpDeskController extends ControllerBase {
    @Autowired
    private HelpDeskServiceImp helpDeskService;

    //************************CHATBOT ENDPOINTS***********************************
    @PostMapping("/new")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<Boolean>> create(@Valid @RequestBody ChatMessageRequest messageRequest) throws InterruptedException {
        System.out.println("Hit the endpoint!!");

        User authenticatedUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (authenticatedUser == null) {
            throw new UnauthorizedException("User is not logged in");
        }
        System.out.println("user is authenticated");

        System.out.println("Request approved. forwarding to service...");
        boolean isSent = helpDeskService.handleSendingMessage(authenticatedUser, messageRequest);

        return ok(isSent);
    }

    //get sessions by userId
    @GetMapping("/sessions/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN, AGENT, CLIENT')")

    public ResponseEntity<ApiResponse<List<ChatSessionDTO>>>getChatsByUserId(@PathVariable("userId") Integer userId) {

        List<ChatSessionDTO> results = helpDeskService.getSessionsByUserId(userId);

        return ok(results);
    }
    //get active session by current auth User
    @GetMapping("sessions/active")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<ChatSessionDTO>>getActiveSessionsByProspectId(){
        System.out.println("Landed in the controller");
        User authenticatedUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (authenticatedUser == null) {
            throw new UnauthorizedException("User is not logged in");
        }
        System.out.println("user is authenticated");

        System.out.println("Request approved. forwarding to service...");
        ChatSessionDTO results = helpDeskService.getActiveSessionsByProspectId(authenticatedUser);
        return ok(results);
    }

    //get all sessions
    @GetMapping("/sessions")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<List<ChatSessionDTO>>>getAllChats() {
        List<ChatSessionDTO> results = helpDeskService.getAllSessions();
        System.out.println("Results abt to go to frontEnd" + results);

        return ok(results);
    }

    //get sessions by chat by user Name
    @GetMapping("/sessions/user/{userName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<List<ChatSessionDTO>>>getChatsByUserFullName(@PathVariable("userName") String userName) {

        List<ChatSessionDTO> results = helpDeskService.getSessionsByUserFullName(userName);

        return ok(results);
    }

    //get session by a message
    @GetMapping("/sessions/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<ChatSessionDTO>>getChatByMessageContent(@RequestParam("messageContent") String messageContent) {
        ChatSessionDTO result = helpDeskService.getSessionByMessageContent(messageContent);
        return ok(result);
    }

    //delete session
    @DeleteMapping("/sessions/delete/{sessionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<Boolean>> deleteSession (@PathVariable("sessionId") Integer sessionId) {
        boolean isDeleted = helpDeskService.deleteById(sessionId);
        return ok(isDeleted);
    }

//*****************************TICKETS ENDPOINTS****************************************

    // create ticket
    @PostMapping("/tickets/new")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<TicketDTO>> createTicket(@Valid @RequestBody TicketRequest ticketRequest) {
        User authenticatedUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (authenticatedUser == null) throw new UnauthorizedException("User is not logged in");
        TicketDTO result = helpDeskService.createTicket(authenticatedUser, ticketRequest);
        return created(result);
    }

    // get all tickets
    @GetMapping("/tickets")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<List<TicketDTO>>> getAllTickets() {
        List<TicketDTO> results = helpDeskService.getAllTickets();
        return ok(results);
    }

    // get tickets by prospectId
    @GetMapping("/tickets/prospect/{prospectId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'CLIENT')")
    public ResponseEntity<ApiResponse<List<TicketDTO>>> getTicketsByProspectId(@PathVariable("prospectId") Integer prospectId) {
        List<TicketDTO> results = helpDeskService.getTicketsByProspectId(prospectId);
        return ok(results);
    }

    // get tickets by prospect name
    @GetMapping("/tickets/prospect/name/{prospectName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<List<TicketDTO>>> getTicketsByProspectName(@PathVariable("prospectName") String prospectName) {
        List<TicketDTO> results = helpDeskService.getTicketsByProspectName(prospectName);
        return ok(results);
    }

    // get tickets by status
    @GetMapping("/tickets/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<List<TicketDTO>>> getTicketsByStatus(@PathVariable("status") TicketStatus status) {
        List<TicketDTO> results = helpDeskService.getTicketsByStatus(status);
        return ok(results);
    }

    // get ticket by title
    @GetMapping("/tickets/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<TicketDTO>> getTicketByTitle(@RequestParam("title") String title) {
        TicketDTO result = helpDeskService.getTicketByTitle(title);
        return ok(result);
    }

    // update ticket
    @PutMapping("/tickets/{ticketId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<TicketDTO>> updateTicket(@PathVariable("ticketId") Integer ticketId, @Valid @RequestBody TicketRequest ticketRequest) {
        System.out.println("Request received by controller: " + ticketRequest);
        TicketDTO result = helpDeskService.updateTicket(ticketId, ticketRequest);
        System.out.println("Ticket updated successfully: " + result);
        return ok(result);
    }

    // delete ticket
    @DeleteMapping("/tickets/delete/{ticketId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<Boolean>> deleteTicket(@PathVariable("ticketId") Integer ticketId) {
        boolean isDeleted = helpDeskService.deleteTicketById(ticketId);
        return ok(isDeleted);
    }


}