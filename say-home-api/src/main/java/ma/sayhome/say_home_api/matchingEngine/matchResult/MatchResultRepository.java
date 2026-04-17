package ma.sayhome.say_home_api.matchingEngine.matchResult;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MatchResultRepository extends JpaRepository <MatchResult,Integer> {

}
