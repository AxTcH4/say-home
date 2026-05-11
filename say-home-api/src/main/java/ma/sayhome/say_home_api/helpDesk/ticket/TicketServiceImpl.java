package ma.sayhome.say_home_api.helpDesk.ticket;

import ma.sayhome.say_home_api.helpDesk.ticket.dto.TicketDTO;
import ma.sayhome.say_home_api.helpDesk.ticket.dto.TicketRequest;
import ma.sayhome.say_home_api.notification.NotificationService;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.prospect.ProspectRepository;
import ma.sayhome.say_home_api.shared.enums.Role;
import ma.sayhome.say_home_api.shared.enums.TicketStatus;
import ma.sayhome.say_home_api.shared.exceptions.ForbiddenException;
import ma.sayhome.say_home_api.shared.exceptions.ResourceNotFoundException;
import ma.sayhome.say_home_api.user.User;
import ma.sayhome.say_home_api.user.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TicketServiceImpl implements TicketService {
    private final ProspectRepository prospectRepository;
    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;

    public TicketServiceImpl(
            ProspectRepository prospectRepository,
            UserRepository userRepository,
            TicketRepository ticketRepository,
            NotificationService notificationService
    ) {
        this.prospectRepository = prospectRepository;
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.notificationService = notificationService;
    }

    @Override
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
        notificationService.createNotificationsForRole(
                " A ticket just got created by " + ticketDTO.getProspect().getUser().getFirstName(),
                Role.ADMIN
        );

        return ticketDTO;
    }

    @Override
    public List<TicketDTO> getAllTickets() {
        List<TicketDTO> results = new ArrayList<>();
        for (Ticket ticket : ticketRepository.findAll()) {
            results.add(TicketDTO.toDTO(ticket));
        }
        return results;
    }

    @Override
    public List<TicketDTO> getTicketsByProspectId(Integer prospectId) {
        Prospect prospect = prospectRepository.findById(prospectId)
                .orElseThrow(() -> new ResourceNotFoundException("Prospect not found"));
        List<TicketDTO> results = new ArrayList<>();
        for (Ticket ticket : ticketRepository.findAllByProspect(prospect)) {
            results.add(TicketDTO.toDTO(ticket));
        }
        return results;
    }

    @Override
    public List<TicketDTO> getTicketsByProspectName(String prospectName) {
        String[] name = prospectName.split(" ");
        Optional<User> userToSearch = userRepository.findUserByFirstNameAndLastName(name[0], name[1]);
        if (userToSearch.isEmpty()) {
            throw new ResourceNotFoundException("User not found");
        }

        Prospect prospect = prospectRepository.findByUser(userToSearch.get());
        if (prospect == null) {
            throw new ResourceNotFoundException("Visitors have no chat sessions ");
        }

        List<TicketDTO> results = new ArrayList<>();
        for (Ticket ticket : ticketRepository.findAllByProspect(prospect)) {
            results.add(TicketDTO.toDTO(ticket));
        }
        return results;
    }

    @Override
    public List<TicketDTO> getTicketsByStatus(TicketStatus status) {
        List<TicketDTO> results = new ArrayList<>();
        for (Ticket ticket : ticketRepository.findAllByStatus(status)) {
            results.add(TicketDTO.toDTO(ticket));
        }
        return results;
    }

    @Override
    public TicketDTO getTicketByTitle(String title) {
        Ticket ticket = ticketRepository.findByTitle(title)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        return TicketDTO.toDTO(ticket);
    }

    @Override
    public TicketDTO updateTicket(Integer ticketId, TicketRequest ticketRequest) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        ticket.setTitle(ticketRequest.getTitle());
        ticket.setDescription(ticketRequest.getDescription());
        ticket.setStatus(ticketRequest.getStatus());
        ticket.setPriority(ticketRequest.getPriority());
        ticket.setUpdatedAt(LocalDateTime.now());
        TicketDTO ticketDTO = TicketDTO.toDTO(ticketRepository.save(ticket));
        notificationService.createNotificationsForRole(
                "The ticket " + ticket.getId() + " was updated to " + ticketDTO.getStatus(),
                Role.ADMIN
        );
        return ticketDTO;
    }

    @Override
    public boolean deleteTicketById(Integer ticketId) {
        ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        ticketRepository.deleteById(ticketId);
        return true;
    }
}
