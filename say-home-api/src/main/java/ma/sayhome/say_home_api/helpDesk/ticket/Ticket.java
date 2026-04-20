package ma.sayhome.say_home_api.chatbot.ticket;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.shared.EntityBase;
import ma.sayhome.say_home_api.shared.enums.TicketStatus;
import jakarta.persistence.*;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prospect_id", nullable = false)
    private Prospect prospect;

    // getters + setters
}