package ma.sayhome.say_home_api.wish;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PropertyRecommendationRepository extends JpaRepository<PropertyRecommendation, Integer> {
    boolean existsByProspectIdAndPropertyId(Integer prospectId, Integer propertyId);
}
