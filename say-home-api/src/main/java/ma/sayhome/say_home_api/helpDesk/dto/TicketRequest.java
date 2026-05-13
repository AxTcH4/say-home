package ma.sayhome.say_home_api.helpDesk.dto;

import lombok.*;
import ma.sayhome.say_home_api.helpDesk.ticket.Ticket;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.shared.enums.TicketPriority;
import ma.sayhome.say_home_api.shared.enums.TicketStatus;
import org.springframework.beans.factory.annotation.Value;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "prospect")

public class TicketRequest {

//    private Integer id;

    private String title;

    private String description;

    private TicketStatus status=TicketStatus.OPEN;

    private TicketPriority priority =TicketPriority.MEDIUM;

    private Integer prospectId;

    public TicketPriority getPriority() {
        return priority == null ? TicketPriority.MEDIUM : priority;
    }


    public static Ticket toEntity(TicketRequest ticketRequest, Prospect prospect) {
        Ticket ticket = new Ticket();

        ticket.setTitle(ticketRequest.getTitle());
        ticket.setDescription(ticketRequest.getDescription());
        ticket.setStatus(ticketRequest.getStatus());
        ticket.setProspect(prospect);
        ticket.setPriority(ticketRequest.getPriority());


        return ticket;
    }
}


