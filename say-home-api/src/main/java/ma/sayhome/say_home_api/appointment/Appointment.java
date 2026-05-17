package ma.sayhome.say_home_api.appointment;
import jakarta.persistence.*;
import lombok.Data;
import ma.sayhome.say_home_api.user.User;
import ma.sayhome.say_home_api.property.Property;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.shared.EntityBase;
import ma.sayhome.say_home_api.shared.enums.AppointmentStatus;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "appointments")
public class Appointment extends EntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private LocalDateTime date;

    @Column(name = "meeting_type")
    private String meetingType;

    @Column(length = 2000)
    private String notes;

    @Column(name = "client_request_message", length = 2000)
    private String clientRequestMessage;

    @Column(name = "client_requested_date")
    private LocalDateTime clientRequestedDate;

    @Column(name = "wish_request_token", unique = true, length = 120)
    private String wishRequestToken;

    @Column(name = "wish_form_sent_at")
    private LocalDateTime wishFormSentAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prospect_id", nullable = false)
    private Prospect prospect;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = true)
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = true)
    private User agent;
}
