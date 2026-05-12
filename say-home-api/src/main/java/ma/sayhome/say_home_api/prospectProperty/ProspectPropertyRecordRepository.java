package ma.sayhome.say_home_api.prospectProperty;

import org.springframework.data.jpa.repository.JpaRepository;
import ma.sayhome.say_home_api.shared.enums.ProspectPropertyStatus;

import java.util.List;
import java.util.Optional;

public interface ProspectPropertyRecordRepository extends JpaRepository<ProspectPropertyRecord, Integer> {
    List<ProspectPropertyRecord> findByProspectIdOrderByUpdatedAtDesc(Integer prospectId);
    List<ProspectPropertyRecord> findByPropertyId(Integer propertyId);
    Optional<ProspectPropertyRecord> findByProspectIdAndPropertyId(Integer prospectId, Integer propertyId);
    long countByProspectIdAndStatus(Integer prospectId, ProspectPropertyStatus status);
}
