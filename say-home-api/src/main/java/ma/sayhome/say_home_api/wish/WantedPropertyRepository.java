package ma.sayhome.say_home_api.wish;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface WantedPropertyRepository extends JpaRepository<WantedProperty, Integer> {
    Optional<WantedProperty> findByToken(String token);
    List<WantedProperty> findByProspectIdOrderByCreatedAtDesc(Integer prospectId);
    List<WantedProperty> findBySubmittedTrueOrderByCreatedAtDesc();
    @Modifying
    @Transactional
    @Query("update WantedProperty w set w.referenceProperty = null where w.referenceProperty.id = :propertyId")
    void clearReferenceProperty(@Param("propertyId") Integer propertyId);
}
