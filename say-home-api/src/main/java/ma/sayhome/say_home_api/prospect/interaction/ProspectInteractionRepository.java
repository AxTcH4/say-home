package ma.sayhome.say_home_api.prospect.interaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProspectInteractionRepository extends JpaRepository<ProspectInteraction, Integer> {
    List<ProspectInteraction> findByProspectIdOrderByCreatedAtDesc(Integer prospectId);
}
