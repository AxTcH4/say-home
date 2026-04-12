package ma.sayhome.say_home_api.matchingEngine.matchResult;
import jakarta.persistence.*;
import ma.sayhome.say_home_api.matchingEngine.matchRun.MatchRun;
import ma.sayhome.say_home_api.property.Property;
import ma.sayhome.say_home_api.shared.EntityBase;
import ma.sayhome.say_home_api.shared.enums.Role;

@Entity
@Table(name = "match_results")
public class MatchResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private Float score;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_run_id", nullable = false)
    private MatchRun matchRun;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    // getters + setters
}