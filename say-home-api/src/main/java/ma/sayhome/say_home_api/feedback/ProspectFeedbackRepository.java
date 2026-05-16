package ma.sayhome.say_home_api.feedback;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProspectFeedbackRepository extends JpaRepository<ProspectFeedback, Integer> {
    Optional<ProspectFeedback> findByToken(String token);
    List<ProspectFeedback> findByProspectIdOrderByCreatedAtDesc(Integer prospectId);
}
