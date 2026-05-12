package ma.sayhome.say_home_api.helpDesk.ticket;

import jakarta.validation.Valid;
import ma.sayhome.say_home_api.helpDesk.ticket.dto.TicketDTO;
import ma.sayhome.say_home_api.helpDesk.ticket.dto.TicketRequest;
import ma.sayhome.say_home_api.shared.ApiResponse;
import ma.sayhome.say_home_api.shared.ControllerBase;
import ma.sayhome.say_home_api.shared.enums.TicketStatus;
import ma.sayhome.say_home_api.shared.exceptions.UnauthorizedException;
import ma.sayhome.say_home_api.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/helpdesk")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class TicketController extends ControllerBase {
    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping("/tickets/new")
    public ResponseEntity<ApiResponse<TicketDTO>> createTicket(@Valid @RequestBody TicketRequest ticketRequest) {
        User authenticatedUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (authenticatedUser == null) {
            throw new UnauthorizedException("User is not logged in");
        }
        return created(ticketService.createTicket(authenticatedUser, ticketRequest));
    }

    @GetMapping("/tickets")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<List<TicketDTO>>> getAllTickets() {
        return ok(ticketService.getAllTickets());
    }

    @GetMapping("/tickets/me")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<List<TicketDTO>>> getMyTickets() {
        User authenticatedUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (authenticatedUser == null) {
            throw new UnauthorizedException("User is not logged in");
        }
        return ok(ticketService.getMyTickets(authenticatedUser));
    }

    @GetMapping("/tickets/prospect/{prospectId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'CLIENT')")
    public ResponseEntity<ApiResponse<List<TicketDTO>>> getTicketsByProspectId(@PathVariable Integer prospectId) {
        return ok(ticketService.getTicketsByProspectId(prospectId));
    }

    @GetMapping("/tickets/prospect/name/{prospectName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<List<TicketDTO>>> getTicketsByProspectName(@PathVariable String prospectName) {
        return ok(ticketService.getTicketsByProspectName(prospectName));
    }

    @GetMapping("/tickets/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<List<TicketDTO>>> getTicketsByStatus(@PathVariable TicketStatus status) {
        return ok(ticketService.getTicketsByStatus(status));
    }

    @GetMapping("/tickets/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<TicketDTO>> getTicketByTitle(@RequestParam String title) {
        return ok(ticketService.getTicketByTitle(title));
    }

    @PutMapping("/tickets/{ticketId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<TicketDTO>> updateTicket(@PathVariable Integer ticketId, @Valid @RequestBody TicketRequest ticketRequest) {
        return ok(ticketService.updateTicket(ticketId, ticketRequest));
    }

    @DeleteMapping("/tickets/delete/{ticketId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<Boolean>> deleteTicket(@PathVariable Integer ticketId) {
        return ok(ticketService.deleteTicketById(ticketId));
    }
}
