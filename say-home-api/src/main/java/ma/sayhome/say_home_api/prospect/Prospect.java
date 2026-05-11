package ma.sayhome.say_home_api.prospect;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.sayhome.say_home_api.appointment.Appointment;
import ma.sayhome.say_home_api.user.User;
import ma.sayhome.say_home_api.helpDesk.chat.session.ChatSession;
import ma.sayhome.say_home_api.helpDesk.ticket.Ticket;
import ma.sayhome.say_home_api.leadScore.LeadScore;
import ma.sayhome.say_home_api.matchingEngine.matchRun.MatchRun;
import ma.sayhome.say_home_api.pipeline.PipelineStage;
import ma.sayhome.say_home_api.shared.EntityBase;
import ma.sayhome.say_home_api.shared.enums.ProspectStatus;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "prospects")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})

public class Prospect extends EntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    private String phone;

    private String city;

    private String source;

    private Float budget;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProspectStatus status = ProspectStatus.NEW;

    // nullable — prospect peut exister sans compte
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_agent_id", nullable = true)
    private User assignedAgent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stage_id", nullable = false)
    private PipelineStage stage;

    @OneToMany(mappedBy = "prospect", cascade = CascadeType.ALL)
    private List<Appointment> appointments = new ArrayList<>();

    @OneToMany(mappedBy = "prospect", cascade = CascadeType.ALL)
    private List<Ticket> tickets = new ArrayList<>();

    @OneToMany(mappedBy = "prospect", cascade = CascadeType.ALL)
    private List<ChatSession> chatSessions = new ArrayList<>();

    @OneToMany(mappedBy = "prospect", cascade = CascadeType.ALL)
    private List<LeadScore> leadScores = new ArrayList<>();

    @OneToMany(mappedBy = "prospect", cascade = CascadeType.ALL)
    private List<MatchRun> matchRuns = new ArrayList<>();

}
