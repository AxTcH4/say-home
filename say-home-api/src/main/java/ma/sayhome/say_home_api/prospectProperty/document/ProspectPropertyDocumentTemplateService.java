package ma.sayhome.say_home_api.prospectProperty.document;

import ma.sayhome.say_home_api.prospectProperty.ProspectPropertyRecord;
import ma.sayhome.say_home_api.prospectProperty.dto.ProspectPropertyExpectedDocumentResponse;
import ma.sayhome.say_home_api.shared.enums.ProspectPropertyDocumentType;
import ma.sayhome.say_home_api.shared.enums.ProspectPropertyStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProspectPropertyDocumentTemplateService {

    public List<ProspectPropertyExpectedDocumentResponse> buildExpectedDocuments(
            ProspectPropertyRecord record,
            List<ProspectPropertyDocument> uploadedDocuments
    ) {
        Set<ProspectPropertyDocumentType> uploadedTypes = uploadedDocuments.stream()
                .map(ProspectPropertyDocument::getType)
                .collect(Collectors.toSet());

        if (record.getStatus() == ProspectPropertyStatus.BOUGHT) {
            return List.of(
                    build(
                            ProspectPropertyDocumentType.BEFORE_SALE_DOCUMENT,
                            "Document avant vente",
                            "Document PDF charge depuis le backoffice au moment de l'affectation.",
                            uploadedTypes
                    ),
                    build(
                            ProspectPropertyDocumentType.SALE_DEED,
                            "Acte de vente",
                            "Document Say Home genere automatiquement apres l'affectation du bien.",
                            uploadedTypes
                    )
            );
        }

        if (record.getStatus() == ProspectPropertyStatus.RENTED) {
            return List.of(
                    build(
                            ProspectPropertyDocumentType.BEFORE_RENTAL_DOCUMENT,
                            "Document avant location",
                            "Document PDF charge depuis le backoffice au moment de l'affectation.",
                            uploadedTypes
                    ),
                    build(
                            ProspectPropertyDocumentType.LEASE_CONTRACT,
                            "Contrat de bail",
                            "Document Say Home genere automatiquement apres l'affectation du bien.",
                            uploadedTypes
                    )
            );
        }

        return List.of();
    }

    private ProspectPropertyExpectedDocumentResponse build(
            ProspectPropertyDocumentType type,
            String title,
            String description,
            Set<ProspectPropertyDocumentType> uploadedTypes
    ) {
        return new ProspectPropertyExpectedDocumentResponse(
                type.name(),
                title,
                description,
                "",
                uploadedTypes.contains(type)
        );
    }
}
