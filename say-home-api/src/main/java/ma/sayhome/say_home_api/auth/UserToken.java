package ma.sayhome.say_home_api.auth;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.sayhome.say_home_api.shared.EntityBase;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_tokens")
public class UserToken extends EntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public UserToken (String token, User user) {
        this.token = token;
        this.user = user;
    }

}
