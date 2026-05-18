package ma.sayhome.say_home_api.user;

import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.prospect.ProspectRepository;
import ma.sayhome.say_home_api.shared.enums.Role;
import ma.sayhome.say_home_api.shared.exceptions.BadRequestException;
import ma.sayhome.say_home_api.shared.exceptions.ResourceNotFoundException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private ProspectRepository prospectRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    private UserServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new UserServiceImpl(userRepository, prospectRepository, passwordEncoder);
        setAuthenticatedUser(Role.ADMIN);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getUsers_shouldReturnOnlyAgents() {
        User agent = buildUser(1, "Agent", "One", "agent@sayhome.ma", Role.AGENT, true);
        User client = buildUser(2, "Client", "One", "client@sayhome.ma", Role.CLIENT, true);
        Prospect assignedProspect = new Prospect();
        assignedProspect.setAssignedAgent(agent);

        when(userRepository.findAll()).thenReturn(List.of(agent, client));
        when(prospectRepository.findAll()).thenReturn(List.of(assignedProspect));

        UsersResponse response = service.getUsers();

        assertEquals(1, response.total());
        assertEquals("Agent One", response.items().get(0).fullName());
        assertEquals(1L, response.items().get(0).activeProspects());
    }

    @Test
    void getUsers_shouldRejectNonAdmin() {
        setAuthenticatedUser(Role.CLIENT);

        assertThrows(ResponseStatusException.class, () -> service.getUsers());
    }

    @Test
    void getUserById_shouldThrowWhenMissing() {
        when(userRepository.findById(9)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getUserById(9));
    }

    @Test
    void createUser_shouldPersistEncodedPassword() {
        UserRequest request = new UserRequest();
        request.firstName = "  Aya ";
        request.lastName = " Agent ";
        request.email = " aya@sayhome.ma ";
        request.password = "secret";
        request.phone = " 0600000000 ";
        request.role = "AGENT_SENIOR";

        when(userRepository.findByEmail(request.email)).thenReturn(Optional.empty());
        when(passwordEncoder.encode("secret")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(4);
            return saved;
        });
        when(prospectRepository.findAll()).thenReturn(List.of());

        UserListItemResponse response = service.createUser(request);

        assertEquals(4, response.id());
        assertEquals("Aya Agent", response.fullName());
        assertEquals("Agent", response.role());
    }

    @Test
    void createUser_shouldRejectDuplicateEmail() {
        UserRequest request = new UserRequest();
        request.firstName = "Aya";
        request.lastName = "Agent";
        request.email = "aya@sayhome.ma";
        request.password = "secret";
        when(userRepository.findByEmail("aya@sayhome.ma")).thenReturn(Optional.of(new User()));

        assertThrows(BadRequestException.class, () -> service.createUser(request));
    }

    @Test
    void updateUser_shouldUpdateFieldsAndNormalizeRole() {
        User existing = buildUser(12, "Old", "Name", "old@sayhome.ma", Role.AGENT, true);
        UserRequest request = new UserRequest();
        request.firstName = " New ";
        request.lastName = " User ";
        request.email = " new@sayhome.ma ";
        request.phone = " 0611 ";
        request.role = "AGENT_JUNIOR";

        when(userRepository.findById(12)).thenReturn(Optional.of(existing));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(prospectRepository.findAll()).thenReturn(List.of());

        UserListItemResponse response = service.updateUser(12, request);

        assertEquals("New User", response.fullName());
        assertEquals("new@sayhome.ma", response.email());
        assertEquals("0611", response.phone());
    }

    @Test
    void updateUser_shouldRejectUnsupportedRole() {
        User existing = buildUser(12, "Old", "Name", "old@sayhome.ma", Role.AGENT, true);
        UserRequest request = new UserRequest();
        request.firstName = "New";
        request.lastName = "User";
        request.email = "new@sayhome.ma";
        request.role = "ADMIN";

        when(userRepository.findById(12)).thenReturn(Optional.of(existing));

        assertThrows(BadRequestException.class, () -> service.updateUser(12, request));
    }

    @Test
    void toggleUserActive_shouldFlipBooleanState() {
        User user = buildUser(2, "Toggle", "User", "toggle@sayhome.ma", Role.AGENT, true);
        when(userRepository.findById(2)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(prospectRepository.findAll()).thenReturn(List.of());

        UserListItemResponse response = service.toggleUserActive(2);

        assertFalse(response.active());
        verify(userRepository).save(user);
    }

    private void setAuthenticatedUser(Role role) {
        User user = buildUser(99, "Admin", "User", "admin@sayhome.ma", role, true);
        SecurityContextHolder.getContext().setAuthentication(new TestingAuthenticationToken(user, null));
    }

    private User buildUser(int id, String firstName, String lastName, String email, Role role, boolean active) {
        User user = new User();
        user.setId(id);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPhone("+212600000000");
        user.setRole(role);
        user.setActive(active);
        user.setPassword("encoded");
        return user;
    }
}
