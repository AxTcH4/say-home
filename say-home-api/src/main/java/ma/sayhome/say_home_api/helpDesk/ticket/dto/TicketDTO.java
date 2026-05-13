package ma.sayhome.say_home_api.helpDesk.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.sayhome.say_home_api.helpDesk.ticket.Ticket;
import ma.sayhome.say_home_api.prospect.dto.ChatSessionOwner;
import ma.sayhome.say_home_api.shared.enums.TicketPriority;
import ma.sayhome.say_home_api.shared.enums.TicketStatus;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TicketDTO {

    private Integer id;

    private String title;

    private String description;

    private TicketStatus status;

    private ChatSessionOwner prospect;

    private TicketPriority priority;

    private LocalDateTime updatedAt;

    public static TicketDTO toDTO(Ticket ticket) {
        TicketDTO ticketDTO = new TicketDTO();
        ticketDTO.setId(ticket.getId());
        ticketDTO.setTitle(ticket.getTitle());
        ticketDTO.setDescription(ticket.getDescription());
        ticketDTO.setStatus(ticket.getStatus());
        ticketDTO.setPriority(ticket.getPriority());
        ticketDTO.setUpdatedAt(ticket.getUpdatedAt());
        ticketDTO.setProspect(
                new ChatSessionOwner(
                        ticket.getProspect().getId(),
                        ticket.getProspect().getStatus(),
<<<<<<< HEAD:say-home-api/src/main/java/ma/sayhome/say_home_api/helpDesk/ticket/dto/TicketDTO.java
                        ma.sayhome.say_home_api.user.dto.UserDTO.toDTO(ticket.getProspect().getUser())
=======
                        ticket.getProspect().getCity(),
                        ticket.getProspect().getSource(),
                        ticket.getProspect().getBudget(),
                        UserDTO.toDTO(ticket.getProspect().getUser())
>>>>>>> feature/chatbot-agent:say-home-api/src/main/java/ma/sayhome/say_home_api/helpDesk/dto/TicketDTO.java
                )
        );
        return ticketDTO;
    }
}
