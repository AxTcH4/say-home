package ma.sayhome.say_home_api.helpDesk.ticket;

import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.shared.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket,Integer> {
    List<Ticket> findAllByProspect(Prospect prospect);
    List<Ticket> findAllByStatus(TicketStatus status);
    Optional<Ticket> findByTitle(String title);
    List<Ticket> findByTitleContainingIgnoreCase(String keyword);
    List<Ticket> findByDescriptionContainingIgnoreCase(String keyword);

    long countByStatus(TicketStatus status);
    List<Ticket> findTop3ByOrderByUpdatedAtDesc();
<<<<<<< HEAD
=======

    @Query("""
    SELECT t FROM Ticket t WHERE t.prospect = :prospect AND t.status <> 'CLOSED' AND t.createdAt >= :limitDate ORDER BY t.createdAt DESC""")
    List<Ticket> findFirstByProspectAndStatusNotAndCreatedAtAfterOrderByCreatedAtDesc(
            @Param("prospect") Prospect prospect,
            @Param("limitDate") LocalDateTime limitDate
    );

>>>>>>> feature/chatbot-agent
}
