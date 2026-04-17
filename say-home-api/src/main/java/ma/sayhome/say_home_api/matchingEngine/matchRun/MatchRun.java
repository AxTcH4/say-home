package ma.sayhome.say_home_api.matchingEngine.matchRun;
import jakarta.persistence.*;
import ma.sayhome.say_home_api.auth.User;
import ma.sayhome.say_home_api.matchingEngine.matchResult.MatchResult;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.shared.EntityBase;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "match_runs")
public class MatchRun extends EntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "matchRun", cascade = CascadeType.ALL)
    private List<MatchResult> results = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prospect_id", nullable = false)
    private Prospect prospect;

    // getters + setters
}