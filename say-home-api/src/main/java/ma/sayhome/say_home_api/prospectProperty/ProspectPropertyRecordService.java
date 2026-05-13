package ma.sayhome.say_home_api.prospectProperty;

import ma.sayhome.say_home_api.property.Property;
import ma.sayhome.say_home_api.property.PropertyRepository;
import ma.sayhome.say_home_api.property.propertyMedia.PropertyMediaServiceImpl;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.prospect.ProspectRepository;
import ma.sayhome.say_home_api.prospectProperty.document.ProspectPropertyDocument;
import ma.sayhome.say_home_api.prospectProperty.document.ProspectPropertyDocumentRepository;
import ma.sayhome.say_home_api.prospectProperty.document.ProspectPropertyDocumentService;
import ma.sayhome.say_home_api.prospectProperty.document.ProspectPropertyDocumentTemplateService;
import ma.sayhome.say_home_api.prospectProperty.dto.CreateProspectPropertyInteractionRequest;
import ma.sayhome.say_home_api.prospectProperty.dto.CreateProspectPropertyRecordRequest;
import ma.sayhome.say_home_api.prospectProperty.dto.ProspectPropertyDocumentResponse;
import ma.sayhome.say_home_api.prospectProperty.dto.ProspectPropertyExpectedDocumentResponse;
import ma.sayhome.say_home_api.prospectProperty.dto.ProspectPropertyInteractionResponse;
import ma.sayhome.say_home_api.prospectProperty.dto.ProspectPropertyRecordResponse;
import ma.sayhome.say_home_api.prospectProperty.dto.UpdateProspectPropertyRecordRequest;
import ma.sayhome.say_home_api.prospectProperty.interaction.ProspectPropertyInteraction;
import ma.sayhome.say_home_api.prospectProperty.interaction.ProspectPropertyInteractionRepository;
import ma.sayhome.say_home_api.shared.enums.PropertyStatus;
import ma.sayhome.say_home_api.shared.enums.ProspectPropertyDocumentType;
import ma.sayhome.say_home_api.shared.enums.ProspectPropertyInteractionType;
import ma.sayhome.say_home_api.shared.enums.ProspectPropertyStatus;
import ma.sayhome.say_home_api.shared.exceptions.BadRequestException;
import ma.sayhome.say_home_api.shared.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional
public class ProspectPropertyRecordService {
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final ProspectPropertyRecordRepository recordRepository;
    private final ProspectRepository prospectRepository;
    private final PropertyRepository propertyRepository;
    private final ProspectPropertyDocumentRepository documentRepository;
    private final ProspectPropertyInteractionRepository interactionRepository;
    private final ProspectPropertyDocumentService documentService;
    private final ProspectPropertyDocumentTemplateService documentTemplateService;
    private final PropertyMediaServiceImpl propertyMediaService;

    public ProspectPropertyRecordService(
            ProspectPropertyRecordRepository recordRepository,
            ProspectRepository prospectRepository,
            PropertyRepository propertyRepository,
            ProspectPropertyDocumentRepository documentRepository,
            ProspectPropertyInteractionRepository interactionRepository,
            ProspectPropertyDocumentService documentService,
            ProspectPropertyDocumentTemplateService documentTemplateService,
            PropertyMediaServiceImpl propertyMediaService
    ) {
        this.recordRepository = recordRepository;
        this.prospectRepository = prospectRepository;
        this.propertyRepository = propertyRepository;
        this.documentRepository = documentRepository;
        this.interactionRepository = interactionRepository;
        this.documentService = documentService;
        this.documentTemplateService = documentTemplateService;
        this.propertyMediaService = propertyMediaService;
    }

    public ProspectPropertyRecordResponse createRecord(CreateProspectPropertyRecordRequest request) {
        if (request.prospectId == null || request.propertyId == null || request.status == null) {
            throw new BadRequestException("Prospect, property and relation status are required");
        }

        if (recordRepository.findByProspectIdAndPropertyId(request.prospectId, request.propertyId).isPresent()) {
            throw new BadRequestException("A relation already exists for this prospect and property");
        }

        Prospect prospect = prospectRepository.findById(request.prospectId)
                .orElseThrow(() -> new ResourceNotFoundException("Prospect not found"));
        Property property = propertyRepository.findById(request.propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        ProspectPropertyRecord record = new ProspectPropertyRecord();
        record.setProspect(prospect);
        record.setProperty(property);
        applyRecordPayload(record, request.status, request.finalPrice, request.notes);
        ProspectPropertyRecord saved = recordRepository.save(record);
        createAutomaticStatusInteraction(saved, null, request.status);

        syncPropertyStatus(property.getId());
        return toResponse(getRequiredRecord(saved.getId()));
    }

    public ProspectPropertyRecordResponse updateRecord(Integer recordId, UpdateProspectPropertyRecordRequest request) {
        ProspectPropertyRecord record = getRequiredRecord(recordId);

        if (request.status == null) {
            throw new BadRequestException("Relation status is required");
        }

        ProspectPropertyStatus previousStatus = record.getStatus();
        applyRecordPayload(record, request.status, request.finalPrice, request.notes);
        ProspectPropertyRecord saved = recordRepository.save(record);
        createAutomaticStatusInteraction(saved, previousStatus, request.status);

        syncPropertyStatus(saved.getProperty().getId());
        return toResponse(getRequiredRecord(saved.getId()));
    }

    public void deleteRecord(Integer recordId) {
        ProspectPropertyRecord record = getRequiredRecord(recordId);
        Integer propertyId = record.getProperty().getId();
        recordRepository.delete(record);
        syncPropertyStatus(propertyId);
    }

    public List<ProspectPropertyRecordResponse> getRecordsByProspectId(Integer prospectId) {
        if (!prospectRepository.existsById(prospectId)) {
            throw new ResourceNotFoundException("Prospect not found");
        }

        return recordRepository.findByProspectIdOrderByUpdatedAtDesc(prospectId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ProspectPropertyRecordResponse addDocuments(
            Integer recordId,
            ProspectPropertyDocumentType type,
            List<MultipartFile> files
    ) throws IOException {
        ProspectPropertyRecord record = getRequiredRecord(recordId);
        if (type == null) {
            throw new BadRequestException("Document type is required");
        }

        documentService.uploadAll(files, record, type);
        createDocumentInteraction(record, type, files);
        return toResponse(getRequiredRecord(recordId));
    }

    public ProspectPropertyRecordResponse deleteDocument(Integer recordId, Integer documentId) {
        ProspectPropertyRecord record = getRequiredRecord(recordId);
        boolean belongsToRecord = record.getDocuments().stream().anyMatch(document -> document.getId().equals(documentId));
        if (!belongsToRecord) {
            throw new ResourceNotFoundException("Document not found for this record");
        }

        documentService.deleteById(documentId);
        return toResponse(getRequiredRecord(recordId));
    }

    public ProspectPropertyRecordResponse addInteraction(
            Integer recordId,
            CreateProspectPropertyInteractionRequest request
    ) {
        ProspectPropertyRecord record = getRequiredRecord(recordId);
        if (request.type == null || request.comment == null || request.comment.isBlank()) {
            throw new BadRequestException("Interaction type and comment are required");
        }

        ProspectPropertyInteraction interaction = new ProspectPropertyInteraction();
        interaction.setRecord(record);
        interaction.setType(request.type);
        interaction.setComment(request.comment.trim());
        interactionRepository.save(interaction);

        return toResponse(getRequiredRecord(recordId));
    }

    private ProspectPropertyRecord getRequiredRecord(Integer recordId) {
        return recordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Prospect property record not found"));
    }

    private void applyRecordPayload(
            ProspectPropertyRecord record,
            ProspectPropertyStatus status,
            Float finalPrice,
            String notes
    ) {
        record.setStatus(status);
        record.setFinalPrice(finalPrice);
        record.setNotes(notes == null ? null : notes.trim());
        record.setUpdatedAt(LocalDateTime.now());
    }

    private void syncPropertyStatus(Integer propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        List<ProspectPropertyRecord> records = recordRepository.findByPropertyId(propertyId);
        PropertyStatus nextStatus = PropertyStatus.AVAILABLE;

        if (records.stream().anyMatch(record -> record.getStatus() == ProspectPropertyStatus.BOUGHT)) {
            nextStatus = PropertyStatus.SOLD;
        } else if (records.stream().anyMatch(record -> record.getStatus() == ProspectPropertyStatus.RENTED)) {
            nextStatus = PropertyStatus.RENTED;
        } else if (records.stream().anyMatch(record -> record.getStatus() == ProspectPropertyStatus.NEGOTIATING)) {
            nextStatus = PropertyStatus.RESERVED;
        }

        property.setStatus(nextStatus);
        propertyRepository.save(property);
    }

    private ProspectPropertyRecordResponse toResponse(ProspectPropertyRecord record) {
        List<ProspectPropertyDocument> documentEntities = documentRepository.findByRecordIdOrderByCreatedAtDesc(record.getId())
                .stream()
                .sorted(Comparator.comparing(ProspectPropertyDocument::getCreatedAt).reversed())
                .toList();
        List<ProspectPropertyDocumentResponse> documents = documentEntities
                .stream()
                .map(this::toDocumentResponse)
                .toList();
        List<ProspectPropertyExpectedDocumentResponse> expectedDocuments = documentTemplateService
                .buildExpectedDocuments(record, documentEntities);
        List<ProspectPropertyInteractionResponse> interactions = interactionRepository.findByRecordIdOrderByCreatedAtDesc(record.getId())
                .stream()
                .map(this::toInteractionResponse)
                .toList();

        Property property = record.getProperty();
        return new ProspectPropertyRecordResponse(
                record.getId(),
                property.getId(),
                property.getTitle(),
                property.getType(),
                property.getSecteur(),
                property.getPrice(),
                property.getStatus().name(),
                record.getStatus().name(),
                record.getFinalPrice(),
                record.getNotes(),
                formatDateTime(record.getCreatedAt()),
                formatDateTime(record.getUpdatedAt()),
                propertyMediaService.getByPropertyId(property.getId()),
                documents,
                expectedDocuments,
                interactions
        );
    }

    private void createAutomaticStatusInteraction(
            ProspectPropertyRecord record,
            ProspectPropertyStatus previousStatus,
            ProspectPropertyStatus nextStatus
    ) {
        if (nextStatus == null || previousStatus == nextStatus) {
            return;
        }

        if (previousStatus == ProspectPropertyStatus.NEGOTIATING
                && nextStatus != ProspectPropertyStatus.BOUGHT
                && nextStatus != ProspectPropertyStatus.RENTED) {
            saveInteraction(record, ProspectPropertyInteractionType.NEGOTIATION_CANCELLED,
                    "La negociation sur ce bien a ete arretee.");
        }

        switch (nextStatus) {
            case FAVORITE -> saveInteraction(record, ProspectPropertyInteractionType.FAVORITED,
                    "Le bien a ete ajoute aux favoris du prospect.");
            case NEGOTIATING -> saveInteraction(record, ProspectPropertyInteractionType.NEGOTIATION_STARTED,
                    "Une negociation a ete ouverte pour ce bien.");
            case BOUGHT -> saveInteraction(record, ProspectPropertyInteractionType.PURCHASE_COMPLETED,
                    "Le bien a ete marque comme achete pour ce prospect.");
            case RENTED -> saveInteraction(record, ProspectPropertyInteractionType.RENT_COMPLETED,
                    "Le bien a ete marque comme loue pour ce prospect.");
        }
    }

    private void createDocumentInteraction(
            ProspectPropertyRecord record,
            ProspectPropertyDocumentType type,
            List<MultipartFile> files
    ) {
        long uploadedCount = files.stream().filter(file -> file != null && !file.isEmpty()).count();
        if (uploadedCount == 0) {
            return;
        }

        saveInteraction(
                record,
                ProspectPropertyInteractionType.DOCUMENT_ADDED,
                "Document ajoute au dossier : " + formatDocumentType(type) + "."
        );
    }

    private void saveInteraction(
            ProspectPropertyRecord record,
            ProspectPropertyInteractionType type,
            String comment
    ) {
        ProspectPropertyInteraction interaction = new ProspectPropertyInteraction();
        interaction.setRecord(record);
        interaction.setType(type);
        interaction.setComment(comment);
        interactionRepository.save(interaction);
    }

    private String formatDocumentType(ProspectPropertyDocumentType type) {
        return switch (type) {
            case SALE_DEED -> "Acte de vente";
            case LAND_TITLE -> "Titre foncier";
            case MORTGAGE_CONTRACT -> "Contrat de credit immobilier";
            case PAYMENT_RECEIPT -> "Recu de paiement";
            case LEASE_CONTRACT -> "Contrat de bail";
            case RENT_RECEIPT -> "Quittance de loyer";
            case PROPERTY_INSPECTION_REPORT -> "Etat des lieux";
            case SECURITY_DEPOSIT_RECEIPT -> "Recu de caution";
            case RECEIPT -> "Recu";
            case CONTRACT -> "Contrat";
            case PAYMENT_PROOF -> "Preuve de paiement";
            case ID_COPY -> "Copie d'identite";
            case OTHER -> "Autre";
        };
    }

    private ProspectPropertyDocumentResponse toDocumentResponse(ProspectPropertyDocument document) {
        return ProspectPropertyDocumentResponse.fromEntity(document, formatDateTime(document.getCreatedAt()));
    }

    private ProspectPropertyInteractionResponse toInteractionResponse(ProspectPropertyInteraction interaction) {
        return new ProspectPropertyInteractionResponse(
                interaction.getId(),
                interaction.getType().name(),
                formatDateTime(interaction.getCreatedAt()),
                interaction.getComment()
        );
    }

    private String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "";
        }
        return DATE_TIME_FORMATTER.format(dateTime);
    }
}
