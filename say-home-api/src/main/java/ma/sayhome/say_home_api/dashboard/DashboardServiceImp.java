package ma.sayhome.say_home_api.dashboard;

import ma.sayhome.say_home_api.auth.User;
import ma.sayhome.say_home_api.auth.UserRepository;
import ma.sayhome.say_home_api.shared.exceptions.BadRequestException;
import ma.sayhome.say_home_api.shared.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class DashboardServiceImp implements DashboardService {

    private final UserRepository userRepository;

    public DashboardServiceImp(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public DashboardProfileResponse getProfile(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return toProfileResponse(user);
    }

    @Override
    public DashboardProfileResponse updateProfile(Integer userId, DashboardProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.firstName == null || request.firstName.isBlank()) {
            throw new BadRequestException("First name is required");
        }

        if (request.lastName == null || request.lastName.isBlank()) {
            throw new BadRequestException("Last name is required");
        }

        user.setFirstName(request.firstName.trim());
        user.setLastName(request.lastName.trim());
        user.setPhone(request.phone == null ? null : request.phone.trim());

        User savedUser = userRepository.save(user);
        return toProfileResponse(savedUser);
    }

    private DashboardProfileResponse toProfileResponse(User user) {
        return new DashboardProfileResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone()
        );
    }

    @Override
    public DashboardSummaryResponse getSummary(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Pour l’instant valeurs statiques
        return new DashboardSummaryResponse(
                0, // boughtProperties
                0, // rentedProperties
                0, // negotiatingProperties
                0  // ticketsCount
        );
    }
}
