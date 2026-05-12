package ma.sayhome.say_home_api.prospectProperty;

import ma.sayhome.say_home_api.property.Property;
import ma.sayhome.say_home_api.property.PropertyRepository;
import ma.sayhome.say_home_api.property.propertyMedia.PropertyMediaServiceImpl;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.prospect.ProspectRepository;
import ma.sayhome.say_home_api.prospectProperty.document.ProspectPropertyDocument;
import ma.sayhome.say_home_api.prospectProperty.document.ProspectPropertyDocumentRepository;
import ma.sayhome.say_home_api.prospectProperty.document.ProspectPropertyDocumentService;
import ma.sayhome.say_home_api.prospectProperty.dto.CreateProspectPropertyInteractionRequest;
import ma.sayhome.say_home_api.prospectProperty.dto.CreateProspectPropertyRecordRequest;
import ma.sayhome.say_home_api.prospectProperty.dto.ProspectPropertyDocumentResponse;
import ma.sayhome.say_home_api.prospectProperty.dto.ProspectPropertyInteractionResponse;
import ma.sayhome.say_home_api.prospectProperty.dto.ProspectPropertyRecordResponse;
import ma.sayhome.say_home_api.prospectProperty.dto.UpdateProspectPropertyRecordRequest;
import ma.sayhome.say_home_api.prospectProperty.interaction.ProspectPropertyInteraction;
import ma.sayhome.say_home_api.prospectProperty.interaction.ProspectPropertyInteractionRepository;
import ma.sayhome.say_home_api.shared.enums.PropertyStatus;
import ma.sayhome.say_home_api.shared.enums.ProspectPropertyDocumentType;
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
    private final PropertyMediaServiceImpl propertyMediaService;

    public ProspectPropertyRecordService(
            ProspectPropertyRecordRepository recordRepository,
            ProspectRepository prospectRepository,
            PropertyRepository propertyRepository,
            ProspectPropertyDocumentRepository documentRepository,
            ProspectPropertyInteractionRepository interactionRepository,
            ProspectPropertyDocumentService documentService,
            PropertyMediaServiceImpl propertyMediaService
    ) {
        this.recordRepository = recordRepository;
        this.prospectRepository = prospectRepository;
        this.propertyRepository = propertyRepository;
        this.documentRepository = documentRepository;
        this.interactionRepository = interactionRepository;
        this.documentService = documentService;
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

        syncPropertyStatus(property.getId());
        return toResponse(saved);
    }

    public ProspectPropertyRecordResponse updateRecord(Integer recordId, UpdateProspectPropertyRecordRequest request) {
        ProspectPropertyRecord record = getRequiredRecord(recordId);

        if (request.status == null) {
            throw new BadRequestException("Relation status is required");
        }

        applyRecordPayload(record, request.status, request.finalPrice, request.notes);
        ProspectPropertyRecord saved = recordRepository.save(record);

        syncPropertyStatus(saved.getProperty().getId());
        return toResponse(saved);
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
        List<ProspectPropertyDocumentResponse> documents = documentRepository.findByRecordIdOrderByCreatedAtDesc(record.getId())
                .stream()
                .sorted(Comparator.comparing(ProspectPropertyDocument::getCreatedAt).reversed())
                .map(this::toDocumentResponse)
                .toList();
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
                interactions
        );
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
