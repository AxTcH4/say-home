package ma.sayhome.say_home_api.prospect;

import ma.sayhome.say_home_api.appointment.Appointment;
import ma.sayhome.say_home_api.leadScore.LeadScoreService;
import ma.sayhome.say_home_api.leadScore.LeadScoreSummary;
import ma.sayhome.say_home_api.pipeline.PipelineStage;
import ma.sayhome.say_home_api.pipeline.PipelineStageRepository;
import ma.sayhome.say_home_api.prospect.dto.CreateProspectInteractionRequest;
import ma.sayhome.say_home_api.prospect.dto.CreateProspectRequest;
import ma.sayhome.say_home_api.prospect.interaction.ProspectInteraction;
import ma.sayhome.say_home_api.prospect.interaction.ProspectInteractionRepository;
import ma.sayhome.say_home_api.prospectProperty.ProspectPropertyRecordService;
import ma.sayhome.say_home_api.prospectProperty.dto.ProspectPropertyDocumentResponse;
import ma.sayhome.say_home_api.prospectProperty.dto.ProspectPropertyExpectedDocumentResponse;
import ma.sayhome.say_home_api.prospectProperty.dto.ProspectPropertyInteractionResponse;
import ma.sayhome.say_home_api.prospectProperty.dto.ProspectPropertyRecordResponse;
import ma.sayhome.say_home_api.shared.enums.AppointmentStatus;
import ma.sayhome.say_home_api.shared.enums.ProspectStatus;
import ma.sayhome.say_home_api.shared.enums.Role;
import ma.sayhome.say_home_api.user.User;
import ma.sayhome.say_home_api.user.UserRepository;
import ma.sayhome.say_home_api.wish.WantedPropertyService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProspectServiceImplTest {

    @Mock
    private ProspectRepository prospectRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PipelineStageRepository pipelineStageRepository;
    @Mock
    private ProspectInteractionRepository prospectInteractionRepository;
    @Mock
    private ProspectPropertyRecordService prospectPropertyRecordService;
    @Mock
    private LeadScoreService leadScoreService;
    @Mock
    private WantedPropertyService wantedPropertyService;

    private ProspectServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new ProspectServiceImpl(
                prospectRepository,
                userRepository,
                pipelineStageRepository,
                prospectInteractionRepository,
                prospectPropertyRecordService,
                leadScoreService,
                wantedPropertyService
        );
        setAuthenticatedUser(Role.ADMIN);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getProspects_shouldFilterAndPaginate() {
        User agent = buildUser(3, Role.AGENT, "Nora", "West");
        Prospect first = buildProspect(1, "Alice", "Blue", "alice@sayhome.ma");
        first.setAssignedAgent(agent);
        first.setSource("Website");
        first.setStatus(ProspectStatus.NEW);
        first.setBudget(1_500_000F);
        first.setCreatedAt(LocalDateTime.now());

        Prospect second = buildProspect(2, "Bob", "Gray", "bob@sayhome.ma");
        second.setStatus(ProspectStatus.CONTACTED);
        second.setSource("Referral");
        second.setCreatedAt(LocalDateTime.now().minusDays(1));

        when(prospectRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneContainingIgnoreCase("Ali", "Ali", "Ali", "Ali"))
                .thenReturn(List.of(first));
        when(prospectRepository.findAll()).thenReturn(List.of(first, second));
        when(leadScoreService.getLatestOrPredictSummary(1)).thenReturn(new LeadScoreSummary(81F, "Hot"));

        var response = service.getProspects("Ali", "NEW", "Nora West", "Website", 1, 10);

        assertEquals(1, response.items().size());
        assertEquals("Alice Blue", response.items().get(0).fullName());
        assertEquals(1, response.total());
    }

    @Test
    void getProspectDetail_shouldAssembleMetricsMeetingsAndInteractions() {
        Prospect prospect = buildProspect(8, "Aya", "Stone", "aya@sayhome.ma");
        prospect.setBudget(1_000_000F);
        prospect.setSource("Website");
        prospect.setCity("Marrakech");

        Appointment appointment = new Appointment();
        appointment.setId(14);
        appointment.setDate(LocalDateTime.now().plusDays(1));
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        ma.sayhome.say_home_api.property.Property property = new ma.sayhome.say_home_api.property.Property();
        property.setId(22);
        property.setTitle("Ocean Villa");
        appointment.setProperty(property);
        prospect.setAppointments(List.of(appointment));

        ProspectInteraction interaction = new ProspectInteraction();
        interaction.setId(31);
        interaction.setType("CALL");
        interaction.setComment("Interested");
        interaction.setCreatedAt(LocalDateTime.now());

        ProspectPropertyRecordResponse propertyRecord = new ProspectPropertyRecordResponse(
                1, 22, "Ocean Villa", "VILLA", "PALMERAIE", 950_000F, "AVAILABLE", "FAVORITE",
                null, null, null, null, null, null, "2026-05-17", "2026-05-17",
                List.of("img"),
                List.of(new ProspectPropertyDocumentResponse(1, "DOC", "url", "/download", "PDF", "2026-05-17")),
                List.of(new ProspectPropertyExpectedDocumentResponse("ID", "Piece", "Desc", "Sample", false)),
                List.of(
                        new ProspectPropertyInteractionResponse(1, "FAVORITED", "2026-05-17", ""),
                        new ProspectPropertyInteractionResponse(2, "VISIT_REQUESTED", "2026-05-17", "")
                )
        );

        when(prospectRepository.findById(8)).thenReturn(Optional.of(prospect));
        when(prospectPropertyRecordService.getRecordsByProspectId(8)).thenReturn(List.of(propertyRecord));
        when(prospectInteractionRepository.findByProspectIdOrderByCreatedAtDesc(8)).thenReturn(List.of(interaction));
        when(leadScoreService.getLatestOrPredictSummary(8)).thenReturn(new LeadScoreSummary(73F, "Warm"));
        when(wantedPropertyService.findByProspectId(8)).thenReturn(List.of());

        var response = service.getProspectDetail(8);

        assertEquals("Aya Stone", response.fullName());
        assertEquals(73, response.aiScore());
        assertEquals(1, response.meetings().size());
        assertEquals(1, response.propertyInsights().size());
        assertEquals(1, response.interactions().size());
    }

    @Test
    void createProspect_shouldValidateAndPersistWithDefaultStage() {
        CreateProspectRequest request = new CreateProspectRequest();
        request.firstName = "  Lina ";
        request.lastName = " Hart ";
        request.email = " lina@sayhome.ma ";
        request.phone = " 0612 ";
        request.city = " Marrakech ";
        request.source = " Website ";
        request.budget = 800_000F;

        PipelineStage stage = new PipelineStage();
        stage.setName("New Lead");

        when(prospectRepository.findByEmail(" lina@sayhome.ma ")).thenReturn(Optional.empty());
        when(pipelineStageRepository.findAll()).thenReturn(List.of(stage));
        when(prospectRepository.save(any(Prospect.class))).thenAnswer(invocation -> {
            Prospect saved = invocation.getArgument(0);
            saved.setId(11);
            return saved;
        });
        when(prospectRepository.findById(11)).thenAnswer(invocation -> Optional.of(invocation.getMock() == null ? null : new Prospect()));

        Prospect savedProspect = new Prospect();
        savedProspect.setId(11);
        savedProspect.setFirstName("Lina");
        savedProspect.setLastName("Hart");
        savedProspect.setEmail("lina@sayhome.ma");
        savedProspect.setPhone("0612");
        savedProspect.setCity("Marrakech");
        savedProspect.setSource("Website");
        savedProspect.setStatus(ProspectStatus.NEW);
        savedProspect.setStage(stage);
        when(prospectRepository.findById(11)).thenReturn(Optional.of(savedProspect));
        when(prospectPropertyRecordService.getRecordsByProspectId(11)).thenReturn(List.of());
        when(prospectInteractionRepository.findByProspectIdOrderByCreatedAtDesc(11)).thenReturn(List.of());
        when(leadScoreService.getLatestOrPredictSummary(11)).thenReturn(new LeadScoreSummary(40F, "Cold"));
        when(wantedPropertyService.findByProspectId(11)).thenReturn(List.of());

        var response = service.createProspect(request);

        assertEquals("Lina Hart", response.fullName());
        assertEquals("NEW", response.status());
    }

    @Test
    void addInteraction_shouldPersistAndRefreshLeadScore() {
        Prospect prospect = buildProspect(9, "Nora", "Green", "nora@sayhome.ma");
        when(prospectRepository.findById(9)).thenReturn(Optional.of(prospect));
        when(prospectPropertyRecordService.getRecordsByProspectId(9)).thenReturn(List.of());
        when(prospectInteractionRepository.findByProspectIdOrderByCreatedAtDesc(9)).thenReturn(List.of());
        when(leadScoreService.getLatestOrPredictSummary(9)).thenReturn(new LeadScoreSummary(51F, "Cold"));
        when(leadScoreService.predict(9)).thenReturn(new ma.sayhome.say_home_api.leadScore.dto.LeadScorePredictionResponse(9, 52F, "Cold", java.util.Map.of(), false));
        when(wantedPropertyService.findByProspectId(9)).thenReturn(List.of());

        CreateProspectInteractionRequest request = new CreateProspectInteractionRequest();
        request.type = " CALL ";
        request.comment = " Interested ";

        service.addInteraction(9, request);

        verify(prospectInteractionRepository).save(any(ProspectInteraction.class));
        verify(leadScoreService).predict(9);
    }

    @Test
    void createProspect_shouldRejectDuplicateEmail() {
        CreateProspectRequest request = new CreateProspectRequest();
        request.firstName = "Lina";
        request.lastName = "Hart";
        request.email = "lina@sayhome.ma";

        when(prospectRepository.findByEmail("lina@sayhome.ma")).thenReturn(Optional.of(new Prospect()));

        assertThrows(ResponseStatusException.class, () -> service.createProspect(request));
    }

    private void setAuthenticatedUser(Role role) {
        SecurityContextHolder.getContext().setAuthentication(new TestingAuthenticationToken(buildUser(99, role, "Admin", "User"), null));
    }

    private User buildUser(int id, Role role, String firstName, String lastName) {
        User user = new User();
        user.setId(id);
        user.setRole(role);
        user.setActive(true);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(firstName.toLowerCase() + "@sayhome.ma");
        return user;
    }

    private Prospect buildProspect(int id, String firstName, String lastName, String email) {
        Prospect prospect = new Prospect();
        prospect.setId(id);
        prospect.setFirstName(firstName);
        prospect.setLastName(lastName);
        prospect.setEmail(email);
        prospect.setStatus(ProspectStatus.NEW);
        prospect.setCreatedAt(LocalDateTime.now());
        return prospect;
    }
}
