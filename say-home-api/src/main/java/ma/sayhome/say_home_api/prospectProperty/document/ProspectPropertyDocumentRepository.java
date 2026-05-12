package ma.sayhome.say_home_api.prospectProperty.document;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProspectPropertyDocumentRepository extends JpaRepository<ProspectPropertyDocument, Integer> {
    List<ProspectPropertyDocument> findByRecordIdOrderByCreatedAtDesc(Integer recordId);
}
