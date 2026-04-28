package ma.sayhome.say_home_api.appointment;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class AppointmentSchemaInitializer implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;

    public AppointmentSchemaInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        jdbcTemplate.execute("ALTER TABLE appointments MODIFY COLUMN property_id INT NULL");
    }
}
