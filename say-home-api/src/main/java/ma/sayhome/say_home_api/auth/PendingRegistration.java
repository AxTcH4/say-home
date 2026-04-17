package ma.sayhome.say_home_api.auth;

import jakarta.persistence.*;
import lombok.Data;
import ma.sayhome.say_home_api.shared.EntityBase;

import java.time.LocalDateTime;
@Data
@Entity
@Table(name = "pending_registrations")
public class PendingRegistration extends EntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column
    private String phone;

    @Column(name = "verification_token", nullable = false, unique = true)
    private String verificationToken;

    @Column(name = "verification_token_expiry", nullable = false)
    private LocalDateTime verificationTokenExpiry;
}
