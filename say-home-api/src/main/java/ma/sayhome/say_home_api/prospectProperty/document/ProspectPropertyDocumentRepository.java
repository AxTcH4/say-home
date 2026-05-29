package ma.sayhome.say_home_api.prospectProperty.document;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import ma.sayhome.say_home_api.shared.enums.ProspectPropertyDocumentType;

public interface ProspectPropertyDocumentRepository extends JpaRepository<ProspectPropertyDocument, Integer> {
    List<ProspectPropertyDocument> findByRecordIdOrderByCreatedAtDesc(Integer recordId);
    Optional<ProspectPropertyDocument> findFirstByRecordIdAndTypeOrderByCreatedAtDesc(
            Integer recordId,
            ProspectPropertyDocumentType type
    );
}
