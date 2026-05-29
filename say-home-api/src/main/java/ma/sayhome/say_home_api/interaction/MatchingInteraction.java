package ma.sayhome.say_home_api.interaction;

import jakarta.persistence.*;
import lombok.*;
import ma.sayhome.say_home_api.shared.EntityBase;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "matching_interactions")
public class MatchingInteraction extends EntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "property_id", nullable = false)
    private Integer propertyId;

    @Column(name = "search_type")
    private String searchType;

    @Column(name = "search_secteur")
    private String searchSecteur;

    @Column(name = "search_min_price")
    private Double searchMinPrice;

    @Column(name = "search_max_price")
    private Double searchMaxPrice;

    @Column(name = "search_min_surface")
    private Double searchMinSurface;

    @Column(name = "search_min_rooms")
    private Double searchMinRooms;

    @Column(nullable = false)
    private Boolean interacted = false;
}
