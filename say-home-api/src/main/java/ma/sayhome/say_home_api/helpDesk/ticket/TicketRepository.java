package ma.sayhome.say_home_api.helpDesk.ticket;

import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.shared.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket,Integer> {
    List<Ticket> findAllByProspect(Prospect prospect);
    List<Ticket> findAllByStatus(TicketStatus status);
    Optional<Ticket> findByTitle(String title);
}
