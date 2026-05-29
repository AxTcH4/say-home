package ma.sayhome.say_home_api.bootstrap;

import ma.sayhome.say_home_api.shared.enums.Role;
import ma.sayhome.say_home_api.user.User;
import ma.sayhome.say_home_api.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BootstrapInitializersTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JdbcTemplate jdbcTemplate;

    @Test
    void adminAccountInitializer_shouldCreateOrUpdateAdminUser() throws Exception {
        User existing = new User();
        when(userRepository.findByEmail("admin@gmail.com")).thenReturn(Optional.of(existing));
        when(passwordEncoder.encode("bootstrap-secret")).thenReturn("encoded");

        AdminAccountInitializer initializer = new AdminAccountInitializer(userRepository, passwordEncoder, "bootstrap-secret");
        initializer.run();

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertEquals(Role.ADMIN, captor.getValue().getRole());
        assertEquals("encoded", captor.getValue().getPassword());
    }

    @Test
    void appointmentSchemaInitializer_shouldExecuteAllSqlStatements() throws Exception {
        AppointmentSchemaInitializer initializer = new AppointmentSchemaInitializer(jdbcTemplate);

        initializer.run();

        verify(jdbcTemplate).execute("ALTER TABLE appointments MODIFY COLUMN property_id INT NULL");
        verify(jdbcTemplate).execute("ALTER TABLE appointments MODIFY COLUMN agent_id INT NULL");
        verify(jdbcTemplate).execute("ALTER TABLE appointments MODIFY COLUMN status VARCHAR(50) NOT NULL");
    }

    @Test
    void userRoleDataInitializer_shouldMigrateLegacyRoles() {
        UserRoleDataInitializer initializer = new UserRoleDataInitializer(jdbcTemplate);

        initializer.migrateLegacyRoles();

        verify(jdbcTemplate).execute("UPDATE users SET role = 'AGENT' WHERE role IN ('AGENT_SENIOR', 'AGENT_JUNIOR')");
    }

    @Test
    void userRoleColumnInitializer_shouldAlterRoleColumn() throws Exception {
        UserRoleColumnInitializer initializer = new UserRoleColumnInitializer(jdbcTemplate);

        initializer.run();

        verify(jdbcTemplate).execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL");
    }
}
