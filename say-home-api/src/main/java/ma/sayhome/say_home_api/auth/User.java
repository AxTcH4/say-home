package ma.sayhome.say_home_api.auth;
import jakarta.persistence.*;
import lombok.*;
import ma.sayhome.say_home_api.shared.EntityBase;
import ma.sayhome.say_home_api.shared.enums.Role;
import ma.sayhome.say_home_api.appointment.Appointment;
import ma.sayhome.say_home_api.notification.Notification;
import ma.sayhome.say_home_api.property.Property;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;


import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Data
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "users")
public class User extends EntityBase implements UserDetails  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Role role;

    @Column(unique = true)
    private String token;

    @Column(nullable = false)
    private Boolean active = true;

    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL)
    private List<Property> properties = new ArrayList<>();

    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL)
    private List<Appointment> appointments = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Notification> notifications = new ArrayList<>();


    public String getFullName(){
        return firstName + " " + lastName;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }



}
