package ma.sayhome.say_home_api.bootstrap;

import ma.sayhome.say_home_api.user.User;
import ma.sayhome.say_home_api.user.UserRepository;
import ma.sayhome.say_home_api.shared.enums.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminAccountInitializer implements CommandLineRunner {
    private static final String DEFAULT_ADMIN_EMAIL = "admin@gmail.com";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String bootstrapAdminSecret;

    public AdminAccountInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${sayhome.bootstrap.admin.secret:admin123}") String bootstrapAdminSecret
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.bootstrapAdminSecret = bootstrapAdminSecret;
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
        adminUser.setPassword(passwordEncoder.encode(bootstrapAdminSecret));

        userRepository.save(adminUser);
    }
}
