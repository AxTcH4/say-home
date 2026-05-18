package ma.sayhome.say_home_api.pipeline;

import ma.sayhome.say_home_api.pipeline.dto.PipelineBoardResponse;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.prospect.ProspectRepository;
import ma.sayhome.say_home_api.shared.enums.ProspectStatus;
import ma.sayhome.say_home_api.shared.enums.Role;
import ma.sayhome.say_home_api.user.User;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PipelineServiceImplTest {

    @Mock
    private ProspectRepository prospectRepository;
    @Mock
    private PipelineStageRepository pipelineStageRepository;

    private PipelineServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new PipelineServiceImpl(prospectRepository, pipelineStageRepository);
        setAuthenticatedUser(Role.ADMIN);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getBoard_shouldFilterAndMapProspects() {
        User agent = buildUser(8, "John", "Doe", Role.AGENT);
        Prospect matching = buildProspect(1, "Alice", "Blue", "Marrakech", "Website", 1_500_000F, ProspectStatus.NEW, agent);
        Prospect filteredOut = buildProspect(2, "Bob", "Gray", "Casablanca", "Referral", 850_000F, ProspectStatus.CONTACTED, agent);

        when(prospectRepository.findAll()).thenReturn(List.of(matching, filteredOut));

        PipelineBoardResponse response = service.getBoard("John Doe", "Marrakech", "Website");

        assertEquals(6, response.columns().size());
        assertEquals(1, response.columns().get(0).count());
        assertEquals("Alice Blue", response.columns().get(0).prospects().get(0).fullName());
        assertTrue(response.columns().get(0).prospects().get(0).budgetLabel().startsWith("1"));
        assertTrue(response.columns().get(0).prospects().get(0).budgetLabel().endsWith("M"));
        assertEquals(1, response.filters().assignedAgents().size());
    }

    @Test
    void getBoard_shouldRejectNonAdmin() {
        setAuthenticatedUser(Role.CLIENT);

        assertThrows(ResponseStatusException.class, () -> service.getBoard(null, null, null));
    }

    @Test
    void updateProspectStatus_shouldValidateStatusAndCreateMissingStage() {
        Prospect prospect = buildProspect(4, "Nora", "Stone", "Rabat", "Website", 500_000F, ProspectStatus.NEW, null);
        when(prospectRepository.findById(4)).thenReturn(Optional.of(prospect));
        when(prospectRepository.findAll()).thenReturn(List.of(prospect));
        when(pipelineStageRepository.findAll()).thenReturn(List.of());
        when(pipelineStageRepository.save(any(PipelineStage.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(prospectRepository.save(any(Prospect.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PipelineBoardResponse response = service.updateProspectStatus(4, "qualified");

        assertEquals(ProspectStatus.QUALIFIED, prospect.getStatus());
        assertNotNull(prospect.getStage());
        assertEquals("Visit Scheduled", prospect.getStage().getName());
        assertEquals(1, response.columns().get(2).count());
    }

    @Test
    void updateProspectStatus_shouldRejectInvalidStatus() {
        Prospect prospect = buildProspect(4, "Nora", "Stone", "Rabat", "Website", 500_000F, ProspectStatus.NEW, null);
        when(prospectRepository.findById(4)).thenReturn(Optional.of(prospect));

        assertThrows(ResponseStatusException.class, () -> service.updateProspectStatus(4, "bad-status"));
    }

    @Test
    void crudMethods_shouldDelegateToRepository() {
        PipelineStage stage = new PipelineStage();
        stage.setId(5);
        stage.setName("Qualified");

        when(pipelineStageRepository.save(any(PipelineStage.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(pipelineStageRepository.findById(5)).thenReturn(Optional.of(stage));
        when(pipelineStageRepository.findAll()).thenReturn(List.of(stage));

        assertEquals("Qualified", service.create(stage).getName());
        assertEquals("Qualified", service.findById(5).getName());
        assertEquals(1, service.findAll().size());

        PipelineStage update = new PipelineStage();
        update.setName("Won");
        PipelineStage updated = service.update(5, update);
        assertEquals("Won", updated.getName());

        service.delete(5);
        verify(pipelineStageRepository).delete(stage);
    }

    private void setAuthenticatedUser(Role role) {
        User user = buildUser(99, "Admin", "User", role);
        SecurityContextHolder.getContext().setAuthentication(new TestingAuthenticationToken(user, null));
    }

    private User buildUser(int id, String firstName, String lastName, Role role) {
        User user = new User();
        user.setId(id);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(role);
        user.setActive(true);
        user.setEmail(firstName.toLowerCase() + "@sayhome.ma");
        return user;
    }

    private Prospect buildProspect(int id, String firstName, String lastName, String city, String source, Float budget, ProspectStatus status, User agent) {
        Prospect prospect = new Prospect();
        prospect.setId(id);
        prospect.setFirstName(firstName);
        prospect.setLastName(lastName);
        prospect.setCity(city);
        prospect.setSource(source);
        prospect.setBudget(budget);
        prospect.setStatus(status);
        prospect.setAssignedAgent(agent);
        return prospect;
    }
}
