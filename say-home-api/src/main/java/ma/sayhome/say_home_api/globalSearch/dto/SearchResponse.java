package ma.sayhome.say_home_api.globalSearch.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.sayhome.say_home_api.helpDesk.chatSession.ChatSession;
import ma.sayhome.say_home_api.helpDesk.dto.TicketDTO;
import ma.sayhome.say_home_api.helpDesk.ticket.Ticket;
import ma.sayhome.say_home_api.property.Property;
import ma.sayhome.say_home_api.property.dto.PropertyDTO;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.prospect.dto.ChatSessionOwner;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SearchResponse {
    //prospects
    private List<ChatSessionOwner> prospects;

    //properties
    private List<PropertyDTO> properties;

    //tickets
    private List<TicketDTO> tickets;

    //TODO:Addd appointments to global search


    public static SearchResponse toDTO(List<Ticket> tickets, List<Prospect> prospects, List<Property> properties) throws ExecutionException, InterruptedException {
        SearchResponse searchResponse = new SearchResponse();

        //map propsects
        List< ChatSessionOwner> prospectsDTO = new ArrayList<>();
        for (Prospect prospect: prospects) {
            ChatSessionOwner chatSessionOwner = ChatSessionOwner.toDTO(prospect);
            prospectsDTO.add(chatSessionOwner);
        }

        //map tickets
        List<TicketDTO> ticketsDTO = new ArrayList<>();
        for (Ticket ticket: tickets) {
            TicketDTO ticketDTO = TicketDTO.toDTO(ticket);
            ticketsDTO.add(ticketDTO);
        }

        //map properties
        List<PropertyDTO> propertiesDTO = new ArrayList<>();
        for (Property property: properties) {
            PropertyDTO propertyDTO = PropertyDTO.toDTO(property);
            propertiesDTO.add(propertyDTO);
        }

        searchResponse.setTickets(ticketsDTO);
        searchResponse.setProspects(prospectsDTO);
        searchResponse.setProperties(propertiesDTO);

        return searchResponse;
    }
}
