package ma.sayhome.say_home_api.wish;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

public interface PropertyRecommendationRepository extends JpaRepository<PropertyRecommendation, Integer> {
    boolean existsByProspectIdAndPropertyId(Integer prospectId, Integer propertyId);
    @Transactional
    void deleteByPropertyId(Integer propertyId);
}
