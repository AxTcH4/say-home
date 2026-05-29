package ma.sayhome.say_home_api.prospectProperty.interaction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProspectPropertyInteractionRepository extends JpaRepository<ProspectPropertyInteraction, Integer> {
    List<ProspectPropertyInteraction> findByRecordIdOrderByCreatedAtDesc(Integer recordId);
}
