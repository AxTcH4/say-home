package ma.sayhome.say_home_api.leadScore;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeadScoreRepository extends JpaRepository<LeadScore, Integer> {

    @Query("SELECT l FROM LeadScore l WHERE l.score = (SELECT MAX(l2.score) FROM LeadScore l2 WHERE l2.prospect = l.prospect) ORDER BY l.score DESC")
    List<LeadScore> findBestScorePerProspect();
}
