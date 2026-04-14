package ma.sayhome.say_home_api.property;

import jakarta.persistence.*;
import ma.sayhome.say_home_api.appointment.Appointment;
import ma.sayhome.say_home_api.auth.User;
import ma.sayhome.say_home_api.matchingEngine.matchResult.MatchResult;
import ma.sayhome.say_home_api.property.propertyMedia.PropertyMedia;
import ma.sayhome.say_home_api.shared.EntityBase;

import java.util.ArrayList;
import java.util.List;

@Entity
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
    }
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }


    public Integer geSurface() { return surface; }
    public void seSurface(Integer surface) { this.surface = surface; }

    public Integer geRooms() { return rooms; }
    public void seRooms(Integer rooms) { this.rooms = rooms; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSecteur() { return secteur; }
    public void setSecteur(String secteur) { this.secteur = secteur; }

    public Float getPrice() { return price; }
    public void setPrice(Float price) { this.price = price; }


    public User getAgent() { return agent; }
    public void setAgent(User agent) { this.agent = agent; }

    public List<PropertyMedia> getMedia() { return media; }
    public void setMedia(List<PropertyMedia> media) { this.media = media; }

    public List<Appointment> getAppointments() { return appointments; }
    public void setAppointments(List<Appointment> appointments) { this.appointments = appointments; }

    public List<MatchResult> getMatchResults() { return matchResults; }
    public void setMatchResults(List<MatchResult> matchResults) { this.matchResults = matchResults; }

    // getters + setters
}