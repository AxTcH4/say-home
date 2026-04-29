package ma.sayhome.say_home_api.auth;

import ma.sayhome.say_home_api.shared.enums.Role;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminAccountInitializer implements CommandLineRunner {
    private static final String DEFAULT_ADMIN_EMAIL = "admin@gmail.com";
    private static final String DEFAULT_ADMIN_PASSWORD = "admin123";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminAccountInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        User adminUser = userRepository.findByEmail(DEFAULT_ADMIN_EMAIL)
                .orElseGet(User::new);

        adminUser.setFirstName("Default");
        adminUser.setLastName("Admin");
        adminUser.setEmail(DEFAULT_ADMIN_EMAIL);
        adminUser.setPhone("+212600000000");
        adminUser.setRole(Role.ADMIN);
        adminUser.setActive(true);
        adminUser.setPassword(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD));

        userRepository.save(adminUser);
    }
}
