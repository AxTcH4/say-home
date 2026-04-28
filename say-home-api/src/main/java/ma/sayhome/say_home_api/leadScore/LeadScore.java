package ma.sayhome.say_home_api.leadScore;
import jakarta.persistence.*;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.shared.EntityBase;


@Entity
@Table(name = "lead_scores")
public class LeadScore extends EntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private Float score;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prospect_id", nullable = false)
    private Prospect prospect;

    public Float getScore() { return score; }
    public void setScore(Float score) { this.score = score; }
    public Prospect getProspect() { return prospect; }
    public void setProspect(Prospect prospect) { this.prospect = prospect; }
}