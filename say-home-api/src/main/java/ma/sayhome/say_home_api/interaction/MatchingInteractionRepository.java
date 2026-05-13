package ma.sayhome.say_home_api.interaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MatchingInteractionRepository extends JpaRepository<MatchingInteraction, Integer> {
}
