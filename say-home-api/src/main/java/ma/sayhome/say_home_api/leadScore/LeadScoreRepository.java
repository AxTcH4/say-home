package ma.sayhome.say_home_api.leadScore;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
<<<<<<< HEAD
import java.util.Optional;

@Repository
public interface LeadScoreRepository extends JpaRepository<LeadScore, Integer> {
    List<LeadScore> findByProspect_IdOrderByCreatedAtDesc(Integer prospectId);
    Optional<LeadScore> findTopByProspect_IdOrderByCreatedAtDesc(Integer prospectId);
=======

@Repository
public interface LeadScoreRepository extends JpaRepository<LeadScore, Integer> {
>>>>>>> feature/chatbot-agent

    @Query("SELECT l FROM LeadScore l WHERE l.score = (SELECT MAX(l2.score) FROM LeadScore l2 WHERE l2.prospect = l.prospect) ORDER BY l.score DESC")
    List<LeadScore> findBestScorePerProspect();
}
