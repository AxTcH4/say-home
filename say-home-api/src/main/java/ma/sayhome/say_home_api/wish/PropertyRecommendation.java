package ma.sayhome.say_home_api.wish;

import jakarta.persistence.Column;
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
import ma.sayhome.say_home_api.shared.EntityBase;
import ma.sayhome.say_home_api.shared.enums.PropertyRecommendationStatus;

@Data
@Entity
@Table(name = "property_recommendations")
public class PropertyRecommendation extends EntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prospect_id", nullable = false)
    private Prospect prospect;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "wanted_property_id", nullable = false)
    private WantedProperty wantedProperty;

    @Column(name = "match_score", nullable = false)
    private Integer matchScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PropertyRecommendationStatus status = PropertyRecommendationStatus.SENT;
}
