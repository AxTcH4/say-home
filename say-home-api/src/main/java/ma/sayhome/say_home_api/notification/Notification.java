package ma.sayhome.say_home_api.notification;
import jakarta.persistence.*;
import ma.sayhome.say_home_api.auth.User;
import ma.sayhome.say_home_api.shared.EntityBase;

@Entity
@Table(name = "notifications")
public class Notification extends EntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private Boolean read = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // getters + setters
}