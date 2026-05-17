package ma.sayhome.say_home_api.wish;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import ma.sayhome.say_home_api.property.Property;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.property.PropertySecteurConverter;
import ma.sayhome.say_home_api.property.PropertyTypeConverter;
import ma.sayhome.say_home_api.shared.EntityBase;
import ma.sayhome.say_home_api.shared.enums.PropertySecteur;
import ma.sayhome.say_home_api.shared.enums.PropertyType;
import ma.sayhome.say_home_api.shared.enums.WantedPropertySource;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "wanted_properties")
public class WantedProperty extends EntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prospect_id", nullable = false)
    private Prospect prospect;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reference_property_id")
    private Property referenceProperty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WantedPropertySource source;

    @Column(unique = true)
    private String token;

    @Column(nullable = false)
    private boolean submitted;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Convert(converter = PropertyTypeConverter.class)
    private PropertyType type;

    @Convert(converter = PropertySecteurConverter.class)
    private PropertySecteur secteur;

    @Column(name = "min_price")
    private Float minPrice;

    @Column(name = "max_price")
    private Float maxPrice;

    @Column(name = "min_surface")
    private Integer minSurface;

    @Column(name = "max_surface")
    private Integer maxSurface;

    @Column(name = "min_rooms")
    private Integer minRooms;

    @Column(name = "max_rooms")
    private Integer maxRooms;

    @Column(name = "min_bathrooms")
    private Integer minBathrooms;

    @Column(name = "max_bathrooms")
    private Integer maxBathrooms;

    private Boolean climatisation;
    private Boolean piscine;
    private Boolean jardin;
    private Boolean garage;
    private Boolean securite;

    @Column(name = "systeme_domotique_complet")
    private Boolean systemeDomotiqueComplet;
}
