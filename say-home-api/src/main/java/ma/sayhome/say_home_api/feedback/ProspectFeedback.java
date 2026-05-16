package ma.sayhome.say_home_api.feedback;

import jakarta.persistence.*;
import lombok.Data;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.prospectProperty.ProspectPropertyRecord;
import ma.sayhome.say_home_api.shared.EntityBase;
import ma.sayhome.say_home_api.shared.enums.FeedbackSentiment;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "prospect_feedback")
public class ProspectFeedback extends EntityBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 120)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(name = "sentiment")
    private FeedbackSentiment sentiment;

    @Column(name = "context_status", nullable = false, length = 40)
    private String contextStatus;

    @Column(name = "property_title")
    private String propertyTitle;

    @Column(length = 2000)
    private String comment;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(nullable = false)
    private boolean submitted = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prospect_id", nullable = false)
    private Prospect prospect;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id")
    private ProspectPropertyRecord record;
}
