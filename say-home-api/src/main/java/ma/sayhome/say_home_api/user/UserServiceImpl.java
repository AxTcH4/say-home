package ma.sayhome.say_home_api.user;

import ma.sayhome.say_home_api.prospect.ProspectRepository;
import ma.sayhome.say_home_api.shared.enums.Role;
import ma.sayhome.say_home_api.shared.exceptions.BadRequestException;
import ma.sayhome.say_home_api.shared.exceptions.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final ProspectRepository prospectRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, ProspectRepository prospectRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.prospectRepository = prospectRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UsersResponse getUsers() {
        assertAdmin();
        List<UserListItemResponse> items = userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.AGENT)
                .map(this::toResponse)
                .toList();

        return new UsersResponse(items, items.size());
    }

    @Override
    public UserListItemResponse getUserById(Integer id) {
        assertAdmin();
        return toResponse(findUser(id));
    }

    @Override
    public UserListItemResponse createUser(UserRequest request) {
        assertAdmin();
        validateRequest(request, true);
        if (userRepository.findByEmail(request.email).isPresent()) {
            throw new BadRequestException("Email already in use");
        }

        User user = new User();
        user.setFirstName(request.firstName.trim());
        user.setLastName(request.lastName.trim());
        user.setEmail(request.email.trim());
        user.setPhone(request.phone == null ? null : request.phone.trim());
        user.setRole(parseRole(request.role));
        user.setActive(true);
        user.setPassword(passwordEncoder.encode(request.password));

        return toResponse(userRepository.save(user));
    }

    @Override
    public UserListItemResponse updateUser(Integer id, UserRequest request) {
        assertAdmin();
        validateRequest(request, false);
        User user = findUser(id);
        user.setFirstName(request.firstName.trim());
        user.setLastName(request.lastName.trim());
        user.setEmail(request.email.trim());
        user.setPhone(request.phone == null ? null : request.phone.trim());
        user.setRole(parseRole(request.role));
        return toResponse(userRepository.save(user));
    }

    @Override
    public UserListItemResponse toggleUserActive(Integer id) {
        assertAdmin();
        User user = findUser(id);
        user.setActive(!Boolean.TRUE.equals(user.getActive()));
        return toResponse(userRepository.save(user));
    }

    private String mapRole(Role role) {
        return switch (role) {
            case AGENT -> "Agent";
            case CLIENT -> "Client";
            case ADMIN -> "Admin";
        };
    }

    private UserListItemResponse toResponse(User user) {
        return new UserListItemResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                mapRole(user.getRole()),
                prospectRepository.findAll().stream()
                        .filter(prospect -> prospect.getAssignedAgent() != null)
                        .filter(prospect -> prospect.getAssignedAgent().getId().equals(user.getId()))
                        .count(),
                Boolean.TRUE.equals(user.getActive())
        );
    }

    private User findUser(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void validateRequest(UserRequest request, boolean requirePassword) {
        if (request.firstName == null || request.firstName.isBlank()) throw new BadRequestException("First name is required");
        if (request.lastName == null || request.lastName.isBlank()) throw new BadRequestException("Last name is required");
        if (request.email == null || request.email.isBlank()) throw new BadRequestException("Email is required");
        if (requirePassword && (request.password == null || request.password.isBlank())) {
            throw new BadRequestException("Password is required");
        }
    }

    private Role parseRole(String role) {
        if (role == null || role.isBlank()) {
            return Role.AGENT;
        }
        if ("AGENT".equals(role) || "AGENT_SENIOR".equals(role) || "AGENT_JUNIOR".equals(role)) {
            return Role.AGENT;
        }
        throw new BadRequestException("Only agent accounts can be managed from the back-office");
    }

    private void assertAdmin() {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (currentUser.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can manage users");
        }
    }
}
