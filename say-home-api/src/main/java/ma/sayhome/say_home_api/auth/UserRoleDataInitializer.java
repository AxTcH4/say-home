package ma.sayhome.say_home_api.auth;

import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class UserRoleDataInitializer {
    private final JdbcTemplate jdbcTemplate;

    public UserRoleDataInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void migrateLegacyRoles() {
        jdbcTemplate.execute(
                "UPDATE users SET role = 'AGENT' WHERE role IN ('AGENT_SENIOR', 'AGENT_JUNIOR')"
        );
    }
}
