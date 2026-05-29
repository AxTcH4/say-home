package ma.sayhome.say_home_api.appointment;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import ma.sayhome.say_home_api.appointment.dto.ClientAppointmentActionRequest;
import ma.sayhome.say_home_api.appointment.dto.ClientVisitRequestResponse;
import ma.sayhome.say_home_api.appointment.dto.CreateVisitRequest;
import ma.sayhome.say_home_api.notification.NotificationService;
import ma.sayhome.say_home_api.pipeline.PipelineStage;
import ma.sayhome.say_home_api.pipeline.PipelineStageRepository;
import ma.sayhome.say_home_api.property.Property;
import ma.sayhome.say_home_api.property.PropertyRepository;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.prospect.ProspectRepository;
import ma.sayhome.say_home_api.prospectProperty.ProspectPropertyRecordService;
import ma.sayhome.say_home_api.shared.enums.AppointmentStatus;
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
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceImplTest {

    @Mock
    private AppointmentRepository appointmentRepository;
    @Mock
    private ProspectRepository prospectRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PropertyRepository propertyRepository;
    @Mock
    private PipelineStageRepository pipelineStageRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private JavaMailSender mailSender;
    @Mock
    private WantedPropertyService wantedPropertyService;
    @Mock
    private ProspectPropertyRecordService prospectPropertyRecordService;

    private AppointmentServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new AppointmentServiceImpl(
                appointmentRepository,
                prospectRepository,
                userRepository,
                prospectRepository,
                propertyRepository,
                pipelineStageRepository,
                notificationService,
                mailSender,
                wantedPropertyService,
                prospectPropertyRecordService
        );
        ReflectionTestUtils.setField(service, "senderEmail", "noreply@sayhome.ma");
        lenient().when(mailSender.createMimeMessage()).thenReturn(new MimeMessage(Session.getInstance(new Properties())));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getBoard_shouldReturnRequestsForAdminAndScheduledEvents() {
        setAuthenticatedUser(buildUser(1, Role.ADMIN));

        Appointment requested = buildAppointment(10, AppointmentStatus.REQUESTED);
        requested.setCreatedAt(LocalDateTime.now().minusHours(1));
        requested.setClientRequestedDate(LocalDateTime.now().plusDays(1));

        Appointment scheduled = buildAppointment(11, AppointmentStatus.SCHEDULED);
        scheduled.setDate(LocalDateTime.now().plusDays(2).withHour(14).withMinute(0));

        when(appointmentRepository.findAll()).thenReturn(List.of(requested, scheduled));

        var board = service.getBoard();

        assertEquals(1, board.requests().size());
        assertEquals(1, board.events().size());
        assertEquals(11, board.events().get(0).id());
    }

    @Test
    void createVisitRequest_shouldCreateProspectAndAppointment() {
        User client = buildUser(7, Role.CLIENT);
        setAuthenticatedUser(client);

        User agent = buildUser(8, Role.AGENT);
        Property property = new Property();
        property.setId(5);
        property.setTitle("Garden Villa");
        property.setPrice(1_300_000F);
        property.setAgent(agent);

        PipelineStage stage = new PipelineStage();
        stage.setName("New Lead");

        CreateVisitRequest request = new CreateVisitRequest();
        request.propertyId = 5;
        request.date = LocalDate.now().plusDays(2).toString();
        request.time = "10:30";
        request.message = "Please confirm";

        when(propertyRepository.findById(5)).thenReturn(Optional.of(property));
        when(prospectRepository.findByUser(client)).thenReturn(null);
        when(pipelineStageRepository.findAll()).thenReturn(List.of(stage));
        when(prospectRepository.save(any(Prospect.class))).thenAnswer(invocation -> {
            Prospect saved = invocation.getArgument(0);
            saved.setId(14);
            return saved;
        });
        when(appointmentRepository.findByProspectUserIdOrderByCreatedAtDesc(7)).thenReturn(List.of());
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> {
            Appointment saved = invocation.getArgument(0);
            saved.setId(55);
            return saved;
        });

        ClientVisitRequestResponse response = service.createVisitRequest(request);

        assertEquals(55, response.id());
        assertEquals("Garden Villa", response.propertyTitle());
        verify(notificationService).createNotificationsForRole(eq("Client User requested a visit for Garden Villa"), eq(Role.ADMIN));
    }

    @Test
    void createVisitRequest_shouldRejectDuplicateActiveRequestForSameProperty() {
        User client = buildUser(7, Role.CLIENT);
        setAuthenticatedUser(client);

        Property property = new Property();
        property.setId(5);
        property.setTitle("Garden Villa");

        Prospect prospect = new Prospect();
        prospect.setId(14);

        Appointment existing = new Appointment();
        existing.setStatus(AppointmentStatus.REQUESTED);
        existing.setProperty(property);
        existing.setDate(LocalDateTime.now().plusDays(3));

        CreateVisitRequest request = new CreateVisitRequest();
        request.propertyId = 5;
        request.date = LocalDate.now().plusDays(2).toString();
        request.time = "10:30";

        when(propertyRepository.findById(5)).thenReturn(Optional.of(property));
        when(prospectRepository.findByUser(client)).thenReturn(prospect);
        when(prospectRepository.save(any(Prospect.class))).thenReturn(prospect);
        when(appointmentRepository.findByProspectUserIdOrderByCreatedAtDesc(7)).thenReturn(List.of(existing));

        assertThrows(ResponseStatusException.class, () -> service.createVisitRequest(request));
    }

    @Test
    void approveRequest_shouldApplyClientRequestedDate() {
        setAuthenticatedUser(buildUser(1, Role.ADMIN));

        Appointment appointment = buildAppointment(20, AppointmentStatus.RESCHEDULE_REQUESTED);
        appointment.setClientRequestedDate(LocalDateTime.now().plusDays(4).withHour(11).withMinute(0));
        when(appointmentRepository.findById(20)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.approveRequest(20);

        assertEquals(AppointmentStatus.SCHEDULED.name(), response.status());
        assertEquals(AppointmentStatus.SCHEDULED, appointment.getStatus());
        verify(notificationService).createNotification(any(), eq(appointment.getProspect().getUser()));
    }

    @Test
    void requestCancellation_shouldSwitchStatusAndNotifyAdmins() {
        User client = buildUser(7, Role.CLIENT);
        setAuthenticatedUser(client);

        Appointment appointment = buildAppointment(21, AppointmentStatus.SCHEDULED);
        appointment.getProspect().setUser(client);
        when(appointmentRepository.findById(21)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ClientAppointmentActionRequest request = new ClientAppointmentActionRequest();
        request.message = "Need to cancel";

        ClientVisitRequestResponse response = service.requestCancellation(21, request);

        assertEquals(AppointmentStatus.CANCELLATION_REQUESTED.name(), response.status());
        verify(notificationService).createNotificationsForRole(eq("Client User requested a meeting cancellation"), eq(Role.ADMIN));
    }

    private void setAuthenticatedUser(User user) {
        SecurityContextHolder.getContext().setAuthentication(new TestingAuthenticationToken(user, null));
    }

    private User buildUser(int id, Role role) {
        User user = new User();
        user.setId(id);
        user.setFirstName(role == Role.CLIENT ? "Client" : "Agent");
        user.setLastName("User");
        user.setEmail(role.name().toLowerCase() + "@sayhome.ma");
        user.setPhone("+212600000000");
        user.setRole(role);
        user.setActive(true);
        return user;
    }

    private Appointment buildAppointment(int id, AppointmentStatus status) {
        User clientUser = buildUser(70, Role.CLIENT);
        User agent = buildUser(71, Role.AGENT);
        Property property = new Property();
        property.setId(72);
        property.setTitle("Palm Villa");
        property.setAgent(agent);

        Prospect prospect = new Prospect();
        prospect.setId(73);
        prospect.setFirstName("Client");
        prospect.setLastName("User");
        prospect.setEmail("client@sayhome.ma");
        prospect.setUser(clientUser);
        prospect.setCity("Marrakech");
        prospect.setBudget(900_000F);

        Appointment appointment = new Appointment();
        appointment.setId(id);
        appointment.setProspect(prospect);
        appointment.setAgent(agent);
        appointment.setProperty(property);
        appointment.setDate(LocalDateTime.now().plusDays(1).withHour(9).withMinute(0));
        appointment.setMeetingType("VISIT");
        appointment.setNotes("Please call");
        appointment.setStatus(status);
        return appointment;
    }
}
