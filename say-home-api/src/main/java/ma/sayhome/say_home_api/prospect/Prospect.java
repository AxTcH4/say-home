package ma.sayhome.say_home_api.prospect;

import jakarta.persistence.*;
import ma.sayhome.say_home_api.appointment.Appointment;
import ma.sayhome.say_home_api.auth.User;
import ma.sayhome.say_home_api.chatbot.chatSession.ChatSession;
import ma.sayhome.say_home_api.chatbot.ticket.Ticket;
import ma.sayhome.say_home_api.leadScore.LeadScore;
import ma.sayhome.say_home_api.matchingEngine.matchRun.MatchRun;
import ma.sayhome.say_home_api.pipeline.PipelineStage;
import ma.sayhome.say_home_api.shared.EntityBase;
import ma.sayhome.say_home_api.shared.enums.ProspectStatus;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "prospects")
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

    private Float budget;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProspectStatus status = ProspectStatus.NEW;

    // nullable — prospect peut exister sans compte
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

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