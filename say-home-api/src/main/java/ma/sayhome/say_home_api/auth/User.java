package ma.sayhome.say_home_api.auth;
import jakarta.persistence.*;
import lombok.Data;
import ma.sayhome.say_home_api.shared.EntityBase;
import ma.sayhome.say_home_api.shared.enums.Role;
import ma.sayhome.say_home_api.appointment.Appointment;
import ma.sayhome.say_home_api.notification.Notification;
import ma.sayhome.say_home_api.property.Property;


import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "users")
public class User extends EntityBase {

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
    @Column(nullable = false)
    private Role role;

    @Column(unique = true)
    private String token;

    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL)
    private List<Property> properties = new ArrayList<>();

    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL)
    private List<Appointment> appointments = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Notification> notifications = new ArrayList<>();





    public String getFullName(){
        return firstName + " " + lastName;
    }
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public List<Property> getProperties() {
        return properties;
    }

    public void setProperties(List<Property> properties) {
        this.properties = properties;
    }

    public List<Appointment> getAppointments() {
        return appointments;
    }

    public void setAppointments(List<Appointment> appointments) {
        this.appointments = appointments;
    }

    public List<Notification> getNotifications() {
        return notifications;
    }

    public void setNotifications(List<Notification> notifications) {
        this.notifications = notifications;
    }
}
