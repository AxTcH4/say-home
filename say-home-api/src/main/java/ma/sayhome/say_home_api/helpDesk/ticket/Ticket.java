package ma.sayhome.say_home_api.helpDesk.ticket;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.shared.EntityBase;
import ma.sayhome.say_home_api.shared.enums.TicketPriority;
import ma.sayhome.say_home_api.shared.enums.TicketStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tickets")
public class Ticket extends EntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketPriority priority;

    @Column(nullable = false)
    private LocalDateTime updatedAt;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prospect_id", nullable = false)
    private Prospect prospect;

    // getters + setters
}