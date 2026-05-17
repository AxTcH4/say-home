package ma.sayhome.say_home_api.property;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import ma.sayhome.say_home_api.appointment.Appointment;
import ma.sayhome.say_home_api.user.User;
import ma.sayhome.say_home_api.matchingEngine.matchResult.MatchResult;
import ma.sayhome.say_home_api.property.propertyMedia.PropertyMedia;
import ma.sayhome.say_home_api.shared.EntityBase;
import ma.sayhome.say_home_api.shared.enums.PropertyOfferType;
import ma.sayhome.say_home_api.shared.enums.PropertySecteur;
import ma.sayhome.say_home_api.shared.enums.PropertyStatus;
import ma.sayhome.say_home_api.shared.enums.PropertyType;

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

    @Column(nullable = false)
    @Convert(converter = PropertyTypeConverter.class)
    private PropertyType type;

    @Column(nullable = false)
    @Convert(converter = PropertySecteurConverter.class)
    private PropertySecteur secteur;

    @Column(nullable = false)
    public Integer surface;

    @Column(nullable = false)
    public Integer rooms;

    @Column
    private Integer bathrooms;

    @Column(nullable = false)
    private Float price;

    @Enumerated(EnumType.STRING)
    @Column(name = "offer_type", nullable = false)
    private PropertyOfferType offerType = PropertyOfferType.SALE;

    @Column
    private Boolean climatisation = false;

    @Column
    private Boolean piscine = false;

    @Column
    private Boolean jardin = false;

    @Column
    private Boolean garage = false;

    @Column
    private Boolean securite = false;

    @Column
    private Boolean systemeDomotiqueComplet = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PropertyStatus status = PropertyStatus.AVAILABLE;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    private User agent;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    private List<PropertyMedia> media = new ArrayList<>();

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    private List<Appointment> appointments = new ArrayList<>();

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    private List<MatchResult> matchResults = new ArrayList<>();

    public Property() {}

    public Property(String title, PropertyType type, PropertySecteur secteur, Float price) {
        this.title = title;
        this.type = type;
        this.secteur = secteur;
        this.price = price;
    }

}
