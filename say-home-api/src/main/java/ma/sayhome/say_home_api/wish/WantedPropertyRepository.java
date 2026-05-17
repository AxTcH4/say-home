package ma.sayhome.say_home_api.wish;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WantedPropertyRepository extends JpaRepository<WantedProperty, Integer> {
    Optional<WantedProperty> findByToken(String token);
    List<WantedProperty> findByProspectIdOrderByCreatedAtDesc(Integer prospectId);
    List<WantedProperty> findBySubmittedTrueOrderByCreatedAtDesc();
}
