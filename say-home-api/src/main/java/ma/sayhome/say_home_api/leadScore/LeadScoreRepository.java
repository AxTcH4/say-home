package ma.sayhome.say_home_api.leadScore;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LeadScoreRepository extends JpaRepository <LeadScore,Integer> {
}
