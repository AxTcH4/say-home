package ma.sayhome.say_home_api.globalSearch;

import jakarta.transaction.Transactional;
import ma.sayhome.say_home_api.globalSearch.dto.SearchResponse;
import ma.sayhome.say_home_api.helpDesk.ticket.Ticket;
import ma.sayhome.say_home_api.helpDesk.ticket.TicketRepository;
import ma.sayhome.say_home_api.property.Property;
import ma.sayhome.say_home_api.property.PropertyRepository;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.prospect.ProspectRepository;
import ma.sayhome.say_home_api.shared.ServiceBase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;


@Service
public class GlobalSearchService {
    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private ProspectRepository prospectRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Transactional
    public SearchResponse findRelatedItems(String keyword) throws ExecutionException, InterruptedException {

        List<Ticket> tickets = new ArrayList<>(ticketRepository.findByTitleContainingIgnoreCase(keyword));
        tickets.addAll(ticketRepository.findByDescriptionContainingIgnoreCase(keyword));

        List<Prospect> prospects = new ArrayList<>(prospectRepository.findByUser_FirstNameContainingIgnoreCase(keyword));
        prospects.addAll(prospectRepository.findByUser_LastNameContainingIgnoreCase(keyword));

        List<Property> properties = new ArrayList<>(propertyRepository.findByTitleContainingIgnoreCase(keyword));
        properties.addAll(propertyRepository.findByDescriptionContainingIgnoreCase(keyword));

        return SearchResponse.toDTO(tickets, prospects, properties);
    }
}
