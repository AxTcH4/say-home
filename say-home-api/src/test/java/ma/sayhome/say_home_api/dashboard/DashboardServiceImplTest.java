package ma.sayhome.say_home_api.dashboard;

import ma.sayhome.say_home_api.appointment.Appointment;
import ma.sayhome.say_home_api.appointment.AppointmentRepository;
import ma.sayhome.say_home_api.dashboard.dto.DashboardProfileResponse;
import ma.sayhome.say_home_api.dashboard.dto.DashboardProfileUpdateRequest;
import ma.sayhome.say_home_api.dashboard.dto.DashboardStatsResponse;
import ma.sayhome.say_home_api.dashboard.dto.DashboardSummaryResponse;
import ma.sayhome.say_home_api.helpDesk.ticket.Ticket;
import ma.sayhome.say_home_api.helpDesk.ticket.TicketRepository;
import ma.sayhome.say_home_api.leadScore.LeadScore;
import ma.sayhome.say_home_api.leadScore.LeadScoreRepository;
import ma.sayhome.say_home_api.property.PropertyRepository;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.prospect.ProspectRepository;
import ma.sayhome.say_home_api.prospectProperty.ProspectPropertyRecordRepository;
import ma.sayhome.say_home_api.prospectProperty.ProspectPropertyRecordService;
import ma.sayhome.say_home_api.prospectProperty.dto.ProspectPropertyRecordResponse;
import ma.sayhome.say_home_api.shared.enums.AppointmentStatus;
import ma.sayhome.say_home_api.shared.enums.PropertyStatus;
import ma.sayhome.say_home_api.shared.enums.ProspectPropertyStatus;
import ma.sayhome.say_home_api.shared.enums.TicketPriority;
import ma.sayhome.say_home_api.shared.enums.TicketStatus;
import ma.sayhome.say_home_api.shared.exceptions.BadRequestException;
import ma.sayhome.say_home_api.shared.exceptions.ResourceNotFoundException;
import ma.sayhome.say_home_api.user.User;
import ma.sayhome.say_home_api.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private ProspectRepository prospectRepository;
    @Mock
    private PropertyRepository propertyRepository;
    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private LeadScoreRepository leadScoreRepository;
    @Mock
    private AppointmentRepository appointmentRepository;
    @Mock
    private ProspectPropertyRecordRepository prospectPropertyRecordRepository;
    @Mock
    private ProspectPropertyRecordService prospectPropertyRecordService;

    private DashboardServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new DashboardServiceImpl(
                userRepository,
                prospectRepository,
                propertyRepository,
                ticketRepository,
                leadScoreRepository,
                appointmentRepository,
                prospectPropertyRecordRepository,
                prospectPropertyRecordService
        );
    }

    @Test
    void getProfile_shouldMapUserFields() {
        User user = buildUser(7, "Sara", "Agent", "sara@sayhome.ma");
        when(userRepository.findById(7)).thenReturn(Optional.of(user));

        DashboardProfileResponse response = service.getProfile(7);

        assertEquals(7, response.getId());
        assertEquals("Sara", response.getFirstName());
        assertEquals("Agent", response.getLastName());
        assertEquals("sara@sayhome.ma", response.getEmail());
        assertEquals("+212600000001", response.getPhone());
    }

    @Test
    void getProfile_shouldThrowWhenUserMissing() {
        when(userRepository.findById(5)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getProfile(5));
    }

    @Test
    void updateProfile_shouldValidateAndTrimValues() {
        User user = buildUser(3, "Old", "Name", "old@sayhome.ma");
        DashboardProfileUpdateRequest request = new DashboardProfileUpdateRequest();
        request.firstName = "  New  ";
        request.lastName = "  Person ";
        request.phone = "  0600000000 ";

        when(userRepository.findById(3)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DashboardProfileResponse response = service.updateProfile(3, request);

        assertEquals("New", response.getFirstName());
        assertEquals("Person", response.getLastName());
        assertEquals("0600000000", response.getPhone());
    }

    @Test
    void updateProfile_shouldRejectBlankFirstName() {
        User user = buildUser(3, "Old", "Name", "old@sayhome.ma");
        DashboardProfileUpdateRequest request = new DashboardProfileUpdateRequest();
        request.firstName = " ";
        request.lastName = "Valid";

        when(userRepository.findById(3)).thenReturn(Optional.of(user));

        assertThrows(BadRequestException.class, () -> service.updateProfile(3, request));
    }

    @Test
    void getSummary_shouldReturnZerosWhenProspectDoesNotExist() {
        User user = buildUser(8, "No", "Prospect", "none@sayhome.ma");
        when(userRepository.findById(8)).thenReturn(Optional.of(user));
        when(prospectRepository.findByUser(user)).thenReturn(null);

        DashboardSummaryResponse response = service.getSummary(8);

        assertEquals(0, response.getBoughtProperties());
        assertEquals(0, response.getRentedProperties());
        assertEquals(0, response.getNegotiatingProperties());
        assertEquals(0, response.getTicketsCount());
    }

    @Test
    void getSummary_shouldUseNegotiatingCountWhenPresent() {
        User user = buildUser(9, "Prospect", "Owner", "prospect@sayhome.ma");
        Prospect prospect = new Prospect();
        prospect.setId(13);
        prospect.setTickets(List.of(new Ticket(), new Ticket()));

        Appointment requested = new Appointment();
        requested.setStatus(AppointmentStatus.REQUESTED);
        Appointment scheduled = new Appointment();
        scheduled.setStatus(AppointmentStatus.SCHEDULED);
        Appointment done = new Appointment();
        done.setStatus(AppointmentStatus.COMPLETED);

        when(userRepository.findById(9)).thenReturn(Optional.of(user));
        when(prospectRepository.findByUser(user)).thenReturn(prospect);
        when(prospectPropertyRecordRepository.countByProspectIdAndStatus(13, ProspectPropertyStatus.NEGOTIATING)).thenReturn(4L);
        when(prospectPropertyRecordRepository.countByProspectIdAndStatus(13, ProspectPropertyStatus.BOUGHT)).thenReturn(1L);
        when(prospectPropertyRecordRepository.countByProspectIdAndStatus(13, ProspectPropertyStatus.RENTED)).thenReturn(2L);
        when(appointmentRepository.findByProspectUserIdOrderByCreatedAtDesc(9)).thenReturn(List.of(requested, scheduled, done));

        DashboardSummaryResponse response = service.getSummary(9);

        assertEquals(1, response.getBoughtProperties());
        assertEquals(2, response.getRentedProperties());
        assertEquals(4, response.getNegotiatingProperties());
        assertEquals(2, response.getTicketsCount());
    }

    @Test
    void getRealEstateRecords_shouldReturnEmptyListWhenProspectMissing() {
        User user = buildUser(10, "No", "Records", "records@sayhome.ma");
        when(userRepository.findById(10)).thenReturn(Optional.of(user));
        when(prospectRepository.findByUser(user)).thenReturn(null);

        assertTrue(service.getRealEstateRecords(10).isEmpty());
    }

    @Test
    void getRealEstateRecords_shouldDelegateToRecordService() {
        User user = buildUser(10, "Real", "Estate", "records@sayhome.ma");
        Prospect prospect = new Prospect();
        prospect.setId(19);
        ProspectPropertyRecordResponse response = new ProspectPropertyRecordResponse(
                1, 2, "Villa", "VILLA", "PALMERAIE", 1_500_000F, "AVAILABLE", "NEGOTIATING",
                null, null, null, null, null, null, "2026-05-17", "2026-05-17",
                List.of(), List.of(), List.of(), List.of()
        );

        when(userRepository.findById(10)).thenReturn(Optional.of(user));
        when(prospectRepository.findByUser(user)).thenReturn(prospect);
        when(prospectPropertyRecordService.getRecordsByProspectId(19)).thenReturn(List.of(response));

        List<ProspectPropertyRecordResponse> results = service.getRealEstateRecords(10);

        assertEquals(1, results.size());
        assertEquals("Villa", results.get(0).propertyTitle());
    }

    @Test
    void getStats_shouldAggregateRepositoriesIntoResponse() {
        when(prospectRepository.count()).thenReturn(11L);
        when(propertyRepository.countByStatus(PropertyStatus.AVAILABLE)).thenReturn(5L);
        when(propertyRepository.countByStatus(PropertyStatus.RESERVED)).thenReturn(3L);
        when(propertyRepository.countByStatus(PropertyStatus.SOLD)).thenReturn(2L);
        when(propertyRepository.count()).thenReturn(10L);
        when(ticketRepository.count()).thenReturn(7L);
        when(ticketRepository.countByStatus(TicketStatus.OPEN)).thenReturn(4L);

        int currentYear = LocalDate.now().getYear();
        when(propertyRepository.countPerMonth(currentYear)).thenReturn(List.<Object[]>of(
                new Object[]{1, 2L},
                new Object[]{5, 4L}
        ));
        when(propertyRepository.countPerMonth(currentYear - 1)).thenReturn(List.<Object[]>of(
                new Object[]{2, 3L}
        ));

        Prospect p1 = new Prospect();
        p1.setFirstName("A");
        p1.setLastName("One");
        p1.setBudget(1_200_000F);
        LeadScore leadScore1 = new LeadScore();
        leadScore1.setProspect(p1);
        leadScore1.setScore(95F);

        Prospect p2 = new Prospect();
        p2.setFirstName("B");
        p2.setLastName("Two");
        p2.setBudget(850_000F);
        LeadScore leadScore2 = new LeadScore();
        leadScore2.setProspect(p2);
        leadScore2.setScore(88F);

        when(leadScoreRepository.findBestScorePerProspect()).thenReturn(List.of(leadScore1, leadScore2));

        Ticket ticket = new Ticket();
        ticket.setId(14);
        ticket.setTitle("Need docs");
        ticket.setDescription("Please share details");
        ticket.setPriority(TicketPriority.HIGH);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setUpdatedAt(LocalDateTime.of(2026, 5, 17, 20, 0));
        when(ticketRepository.findTop3ByOrderByUpdatedAtDesc()).thenReturn(List.of(ticket));

        DashboardStatsResponse response = service.getStats();

        assertEquals(11L, response.getTotalProspects());
        assertEquals(20.0, response.getConversionRate());
        assertEquals(12, response.getMonthlyThisYear().size());
        assertEquals(2L, response.getMonthlyThisYear().get(0));
        assertEquals(4L, response.getMonthlyThisYear().get(4));
        assertEquals(3L, response.getMonthlyLastYear().get(1));
        assertEquals(2, response.getHotProspects().size());
        assertEquals("Need docs", response.getRecentTickets().get(0).getTitle());
    }

    private User buildUser(int id, String firstName, String lastName, String email) {
        User user = new User();
        user.setId(id);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPhone("+212600000001");
        user.setActive(true);
        return user;
    }
}
