package ma.sayhome.say_home_api.matchingEngine.matchRun;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MatchRunRepository extends JpaRepository<MatchRun,Integer> {
}
