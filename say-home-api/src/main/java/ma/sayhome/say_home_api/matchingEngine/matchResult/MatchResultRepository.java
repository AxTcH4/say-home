package ma.sayhome.say_home_api.matchingEngine.matchResult;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface MatchResultRepository extends JpaRepository <MatchResult,Integer> {
    @Transactional
    void deleteByPropertyId(Integer propertyId);
}
