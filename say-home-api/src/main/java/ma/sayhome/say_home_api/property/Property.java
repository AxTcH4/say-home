package ma.sayhome.say_home_api.property;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import ma.sayhome.say_home_api.appointment.Appointment;
import ma.sayhome.say_home_api.auth.User;
import ma.sayhome.say_home_api.matchingEngine.matchResult.MatchResult;
import ma.sayhome.say_home_api.property.propertyMedia.PropertyMedia;
import ma.sayhome.say_home_api.shared.EntityBase;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Entity
@ToString(exclude = {"agent"})
@Table(name = "properties")
public class Property extends EntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String title;

    private String description;

    private String type;

    private String secteur;

    @Column(nullable = false)
    public Integer surface;

    @Column(nullable = false)
    public Integer rooms;

    @Column(nullable = false)
    private Float price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = false)
    private User agent;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    private List<PropertyMedia> media = new ArrayList<>();

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    private List<Appointment> appointments = new ArrayList<>();

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    private List<MatchResult> matchResults = new ArrayList<>();

    public Property() {}

    public Property(String title, String type, String secteur, Float price) {
        this.title = title;
        this.type = type;
        this.secteur = secteur;
        this.price = price;
    }

}