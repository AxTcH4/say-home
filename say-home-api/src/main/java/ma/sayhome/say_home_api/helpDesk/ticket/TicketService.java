package ma.sayhome.say_home_api.helpDesk.ticket;

import ma.sayhome.say_home_api.helpDesk.ticket.dto.TicketDTO;
import ma.sayhome.say_home_api.helpDesk.ticket.dto.TicketRequest;
import ma.sayhome.say_home_api.shared.enums.TicketStatus;
import ma.sayhome.say_home_api.user.User;

import java.util.List;

public interface TicketService {
    TicketDTO createTicket(User authenticatedUser, TicketRequest ticketRequest);
    List<TicketDTO> getAllTickets();
    List<TicketDTO> getMyTickets(User authenticatedUser);
    List<TicketDTO> getTicketsByProspectId(Integer prospectId);
    List<TicketDTO> getTicketsByProspectName(String prospectName);
    List<TicketDTO> getTicketsByStatus(TicketStatus status);
    TicketDTO getTicketByTitle(String title);
    TicketDTO updateTicket(Integer ticketId, TicketRequest ticketRequest);
    boolean deleteTicketById(Integer ticketId);
}
