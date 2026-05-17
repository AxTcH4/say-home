package ma.sayhome.say_home_api.prospect;

import ma.sayhome.say_home_api.appointment.Appointment;
import ma.sayhome.say_home_api.leadScore.LeadScoreService;
import ma.sayhome.say_home_api.leadScore.LeadScoreSummary;
import ma.sayhome.say_home_api.pipeline.PipelineStage;
import ma.sayhome.say_home_api.pipeline.PipelineStageRepository;
import ma.sayhome.say_home_api.prospect.dto.CreateProspectInteractionRequest;
import ma.sayhome.say_home_api.prospect.dto.CreateProspectRequest;
import ma.sayhome.say_home_api.prospect.dto.LeadScoreMetricsResponse;
import ma.sayhome.say_home_api.prospect.dto.ProspectDetailResponse;
import ma.sayhome.say_home_api.prospect.dto.ProspectFiltersResponse;
import ma.sayhome.say_home_api.prospect.dto.ProspectInteractionResponse;
import ma.sayhome.say_home_api.prospect.dto.ProspectListItemResponse;
import ma.sayhome.say_home_api.prospect.dto.ProspectListResponse;
import ma.sayhome.say_home_api.prospect.dto.ProspectMeetingResponse;
import ma.sayhome.say_home_api.prospect.dto.ProspectPropertyInsightResponse;
import ma.sayhome.say_home_api.prospect.interaction.ProspectInteraction;
import ma.sayhome.say_home_api.prospect.interaction.ProspectInteractionRepository;
import ma.sayhome.say_home_api.prospectProperty.ProspectPropertyRecordService;
import ma.sayhome.say_home_api.prospectProperty.dto.ProspectPropertyRecordResponse;
import ma.sayhome.say_home_api.shared.enums.AppointmentStatus;
import ma.sayhome.say_home_api.shared.enums.ProspectStatus;
import ma.sayhome.say_home_api.shared.enums.Role;
import ma.sayhome.say_home_api.user.User;
import ma.sayhome.say_home_api.user.UserRepository;
import ma.sayhome.say_home_api.wish.WantedPropertyService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
public class ProspectServiceImpl implements ProspectService {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final ProspectRepository prospectRepository;
    private final UserRepository userRepository;
    private final PipelineStageRepository pipelineStageRepository;
    private final ProspectInteractionRepository prospectInteractionRepository;
    private final ProspectPropertyRecordService prospectPropertyRecordService;
    private final LeadScoreService leadScoreService;
    private final WantedPropertyService wantedPropertyService;

    public ProspectServiceImpl(
            ProspectRepository prospectRepository,
            UserRepository userRepository,
            PipelineStageRepository pipelineStageRepository,
            ProspectInteractionRepository prospectInteractionRepository,
            ProspectPropertyRecordService prospectPropertyRecordService,
            LeadScoreService leadScoreService,
            WantedPropertyService wantedPropertyService
    ) {
        this.prospectRepository = prospectRepository;
        this.userRepository = userRepository;
        this.pipelineStageRepository = pipelineStageRepository;
        this.prospectInteractionRepository = prospectInteractionRepository;
        this.prospectPropertyRecordService = prospectPropertyRecordService;
        this.leadScoreService = leadScoreService;
        this.wantedPropertyService = wantedPropertyService;
    }

    public ProspectListResponse getProspects(
            String search,
            String status,
            String assignedAgent,
            String source,
            int page,
            int pageSize
    ) {
        assertAdmin();
        List<Prospect> prospects = (search == null || search.isBlank())
                ? prospectRepository.findAll()
                : prospectRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneContainingIgnoreCase(
                        search, search, search, search
                );

        List<Prospect> filteredProspects = prospects.stream()
                .filter(prospect -> matchesStatus(prospect, status))
                .filter(prospect -> matchesAssignedAgent(prospect, assignedAgent))
                .filter(prospect -> matchesSource(prospect, source))
                .sorted(Comparator.comparing(Prospect::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        List<ProspectListItemResponse> items = filteredProspects.stream()
                .map(this::toListItem)
                .toList();
        int safePageSize = Math.max(1, Math.min(pageSize, 100));
        int safePage = Math.max(1, page);
        int total = items.size();
        int fromIndex = Math.min((safePage - 1) * safePageSize, total);
        int toIndex = Math.min(fromIndex + safePageSize, total);
        List<ProspectListItemResponse> paginatedItems = items.subList(fromIndex, toIndex);

        ProspectFiltersResponse filters = new ProspectFiltersResponse(
                prospectRepository.findAll().stream().map(Prospect::getStatus).filter(Objects::nonNull).map(Enum::name).distinct().sorted().toList(),
                prospectRepository.findAll().stream().map(Prospect::getAssignedAgent).filter(Objects::nonNull).map(User::getFullName).distinct().sorted().toList(),
                prospectRepository.findAll().stream().map(Prospect::getSource).filter(value -> value != null && !value.isBlank()).distinct().sorted().toList()
        );

        return new ProspectListResponse(paginatedItems, total, safePage, safePageSize, filters);
    }

    public ProspectDetailResponse getProspectDetail(Integer id) {
//        assertAdmin();
        Prospect prospect = getRequiredProspect(id);
        List<ProspectPropertyRecordResponse> propertyRecords =
                prospectPropertyRecordService.getRecordsByProspectId(id);
        List<Appointment> appointments = prospect.getAppointments() == null
                ? List.of()
                : prospect.getAppointments();

        List<ProspectInteractionResponse> interactions = prospectInteractionRepository
                .findByProspectIdOrderByCreatedAtDesc(id)
                .stream()
                .map(interaction -> new ProspectInteractionResponse(
                        interaction.getId(),
                        interaction.getType(),
                        formatDate(interaction.getCreatedAt()),
                        interaction.getComment()
                ))
                .toList();
        List<ProspectMeetingResponse> meetings = appointments.stream()
                .sorted(Comparator.comparing(Appointment::getDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toMeetingResponse)
                .toList();

        LeadScoreSummary leadScore = leadScoreService.getLatestOrPredictSummary(id);

        return new ProspectDetailResponse(
                prospect.getId(),
                effectiveFullName(prospect),
                effectiveEmail(prospect),
                effectivePhone(prospect),
                safeValue(prospect.getCity()),
                formatBudgetLabel(prospect.getBudget()),
                prospect.getBudget(),
                prospect.getStatus().name(),
                Math.round(leadScore.score()),
                safeValue(prospect.getSource()),
                prospect.getAssignedAgent() != null ? prospect.getAssignedAgent().getFullName() : null,
                "Not specified",
                formatDate(prospect.getCreatedAt()),
                "",
                leadScore.classification(),
                buildLeadScoreMetrics(prospect, propertyRecords, appointments, leadScore),
                buildPropertyInsights(propertyRecords, appointments),
                interactions,
                meetings,
                wantedPropertyService.findByProspectId(id),
                propertyRecords
        );
    }

    public ProspectDetailResponse createProspect(CreateProspectRequest request) {
        assertAdmin();
        validateCreateRequest(request);

        prospectRepository.findByEmail(request.email)
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "A prospect with this email already exists");
                });

        Prospect prospect = new Prospect();
        applyRequest(prospect, request);
        prospect.setStatus(ProspectStatus.NEW);
        prospect.setStage(getOrCreateDefaultStage());

        Prospect saved = prospectRepository.save(prospect);
        return getProspectDetail(saved.getId());
    }

    public ProspectDetailResponse updateProspect(Integer id, CreateProspectRequest request) {
        assertAdmin();
        validateCreateRequest(request);

        Prospect prospect = getRequiredProspect(id);
        prospectRepository.findByEmail(request.email)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "A prospect with this email already exists");
                });

        applyRequest(prospect, request);
        Prospect saved = prospectRepository.save(prospect);
        return getProspectDetail(saved.getId());
    }

    public ProspectDetailResponse addInteraction(Integer id, CreateProspectInteractionRequest request) {
        assertAdmin();
        Prospect prospect = getRequiredProspect(id);

        if (request.type == null || request.type.isBlank() || request.comment == null || request.comment.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Interaction type and comment are required");
        }

        ProspectInteraction interaction = new ProspectInteraction();
        interaction.setProspect(prospect);
        interaction.setType(request.type.trim());
        interaction.setComment(request.comment.trim());
        prospectInteractionRepository.save(interaction);
        refreshLeadScoreQuietly(id);

        return getProspectDetail(id);
    }

    @Override
    public Prospect create(Prospect entity) {
        return prospectRepository.save(entity);
    }

    @Override
    public Prospect findById(Integer integer) {
        assertAdmin();
        return getRequiredProspect(integer);
    }

    @Override
    public List<Prospect> findAll() {
        assertAdmin();
        return prospectRepository.findAll();
    }

    @Override
    public Prospect update(Integer integer, Prospect entity) {
        assertAdmin();
        Prospect existing = getRequiredProspect(integer);
        entity.setId(existing.getId());
        return prospectRepository.save(entity);
    }

    @Override
    public void delete(Integer integer) {
        assertAdmin();
        Prospect prospect = getRequiredProspect(integer);
        prospectRepository.delete(prospect);
    }

    private void assertAdmin() {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (currentUser.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can manage prospects");
        }
    }

    private Prospect getRequiredProspect(Integer id) {
        return prospectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prospect not found"));
    }

    private ProspectListItemResponse toListItem(Prospect prospect) {
        LeadScoreSummary leadScore = leadScoreService.getLatestOrPredictSummary(prospect.getId());
        return new ProspectListItemResponse(
                prospect.getId(),
                effectiveFullName(prospect),
                effectiveEmail(prospect),
                effectivePhone(prospect),
                safeValue(prospect.getCity()),
                formatBudgetLabel(prospect.getBudget()),
                prospect.getStatus().name(),
                Math.round(leadScore.score()),
                safeValue(prospect.getSource()),
                prospect.getAssignedAgent() != null ? prospect.getAssignedAgent().getFullName() : null
        );
    }

    private void applyRequest(Prospect prospect, CreateProspectRequest request) {
        prospect.setFirstName(request.firstName.trim());
        prospect.setLastName(request.lastName.trim());
        prospect.setEmail(request.email.trim());
        prospect.setPhone(request.phone != null ? request.phone.trim() : null);
        prospect.setCity(request.city != null ? request.city.trim() : null);
        prospect.setSource(request.source != null ? request.source.trim() : null);
        prospect.setBudget(request.budget);
        prospect.setAssignedAgent(resolveAssignedAgent(request.assignedAgentId));
        if (prospect.getStage() == null) {
            prospect.setStage(getOrCreateDefaultStage());
        }
    }

    private User resolveAssignedAgent(Integer assignedAgentId) {
        if (assignedAgentId == null) return null;

        User agent = userRepository.findById(assignedAgentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assigned agent not found"));
        if (agent.getRole() != Role.AGENT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only an agent can be assigned to a prospect");
        }
        return agent;
    }

    private PipelineStage getOrCreateDefaultStage() {
        return pipelineStageRepository.findAll().stream()
                .filter(stage -> "New Lead".equalsIgnoreCase(stage.getName()) || "NEW".equalsIgnoreCase(stage.getName()))
                .findFirst()
                .orElseGet(() -> {
                    PipelineStage stage = new PipelineStage();
                    stage.setName("New Lead");
                    return pipelineStageRepository.save(stage);
                });
    }

    private void validateCreateRequest(CreateProspectRequest request) {
        if (request.firstName == null || request.firstName.isBlank()
                || request.lastName == null || request.lastName.isBlank()
                || request.email == null || request.email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "First name, last name and email are required");
        }
    }

    private boolean matchesStatus(Prospect prospect, String status) {
        return status == null || status.isBlank() || prospect.getStatus().name().equalsIgnoreCase(status);
    }

    private boolean matchesAssignedAgent(Prospect prospect, String assignedAgent) {
        return assignedAgent == null || assignedAgent.isBlank()
                || (prospect.getAssignedAgent() != null && prospect.getAssignedAgent().getFullName().equalsIgnoreCase(assignedAgent));
    }

    private boolean matchesSource(Prospect prospect, String source) {
        return source == null || source.isBlank()
                || (prospect.getSource() != null && prospect.getSource().equalsIgnoreCase(source));
    }

    private String formatBudgetLabel(Float budget) {
        if (budget == null) return "Not specified";
        if (budget >= 1_000_000) {
            return String.format("%.1fM", budget / 1_000_000f);
        }
        return String.format("%.0fk", budget / 1_000f);
    }

    private String formatDate(java.time.LocalDateTime dateTime) {
        if (dateTime == null) return "";
        return DATE_FORMATTER.format(dateTime);
    }

    private String safeValue(String value) {
        return value == null ? "" : value;
    }

    private String effectiveFullName(Prospect prospect) {
        String firstName = firstNonBlank(
                prospect.getFirstName(),
                prospect.getUser() != null ? prospect.getUser().getFirstName() : null
        );
        String lastName = firstNonBlank(
                prospect.getLastName(),
                prospect.getUser() != null ? prospect.getUser().getLastName() : null
        );

        return (firstName + " " + lastName).trim();
    }

    private String effectiveEmail(Prospect prospect) {
        return firstNonBlank(
                prospect.getEmail(),
                prospect.getUser() != null ? prospect.getUser().getEmail() : null
        );
    }

    private String effectivePhone(Prospect prospect) {
        return firstNonBlank(
                prospect.getPhone(),
                prospect.getUser() != null ? prospect.getUser().getPhone() : null
        );
    }

    private String firstNonBlank(String primary, String fallback) {
        if (primary != null && !primary.isBlank()) {
            return primary;
        }
        if (fallback != null && !fallback.isBlank()) {
            return fallback;
        }
        return "";
    }

    private ProspectMeetingResponse toMeetingResponse(Appointment appointment) {
        LocalDateTime date = appointment.getDate();
        LocalTime time = date != null ? date.toLocalTime() : null;

        return new ProspectMeetingResponse(
                appointment.getId(),
                appointment.getMeetingType(),
                formatDate(date),
                time != null ? TIME_FORMATTER.format(time) : "",
                appointment.getStatus().name(),
                appointment.getProperty() != null ? appointment.getProperty().getTitle() : ""
        );
    }

    private LeadScoreMetricsResponse buildLeadScoreMetrics(
            Prospect prospect,
            List<ProspectPropertyRecordResponse> propertyRecords,
            List<Appointment> appointments,
            LeadScoreSummary leadScore
    ) {
        int totalInteractions = prospectInteractionRepository.findByProspectIdOrderByCreatedAtDesc(prospect.getId()).size();
        int favoriteCount = (int) propertyRecords.stream()
                .filter(record -> "FAVORITE".equals(record.relationStatus()))
                .count();
        int confirmedMeetings = (int) appointments.stream()
                .filter(appointment -> appointment.getStatus() == AppointmentStatus.SCHEDULED
                        || appointment.getStatus() == AppointmentStatus.COMPLETED)
                .count();
        int negotiationCount = (int) propertyRecords.stream()
                .filter(record -> "NEGOTIATING".equals(record.relationStatus()))
                .count();
        int completeDossierCount = (int) propertyRecords.stream()
                .filter(record -> record.documents() != null && !record.documents().isEmpty())
                .count();
        float budget = prospect.getBudget() != null ? prospect.getBudget() : 0f;
        float budgetGap = propertyRecords.stream()
                .filter(record -> record.propertyPrice() != null)
                .map(record -> Math.abs(budget - record.propertyPrice()))
                .min(Float::compareTo)
                .orElse(0f);

        return new LeadScoreMetricsResponse(
                Math.round(leadScore.score()),
                leadScore.classification(),
                totalInteractions,
                propertyRecords.size(),
                favoriteCount,
                confirmedMeetings,
                appointments.size(),
                totalInteractions,
                negotiationCount,
                completeDossierCount,
                prospect.getBudget(),
                budgetGap
        );
    }

    private List<ProspectPropertyInsightResponse> buildPropertyInsights(
            List<ProspectPropertyRecordResponse> propertyRecords,
            List<Appointment> appointments
    ) {
        return propertyRecords.stream()
                .map(record -> {
                    long requestMeetingsCount = appointments.stream()
                            .filter(appointment -> appointment.getProperty() != null)
                            .filter(appointment -> appointment.getProperty().getId().equals(record.propertyId()))
                            .filter(appointment -> appointment.getStatus() == AppointmentStatus.REQUESTED
                                    || appointment.getStatus() == AppointmentStatus.RESCHEDULE_REQUESTED
                                    || appointment.getStatus() == AppointmentStatus.CANCELLATION_REQUESTED)
                            .count();
                    long confirmedMeetingsCount = appointments.stream()
                            .filter(appointment -> appointment.getProperty() != null)
                            .filter(appointment -> appointment.getProperty().getId().equals(record.propertyId()))
                            .filter(appointment -> appointment.getStatus() == AppointmentStatus.SCHEDULED)
                            .count();
                    long completedMeetingsCount = appointments.stream()
                            .filter(appointment -> appointment.getProperty() != null)
                            .filter(appointment -> appointment.getProperty().getId().equals(record.propertyId()))
                            .filter(appointment -> appointment.getStatus() == AppointmentStatus.COMPLETED)
                            .count();
                    int favoriteInteractions = (int) record.interactions().stream()
                            .filter(interaction -> "FAVORITED".equals(interaction.type()))
                            .count();
                    int visitRequestedInteractions = (int) record.interactions().stream()
                            .filter(interaction -> "VISIT_REQUESTED".equals(interaction.type()))
                            .count();
                    int visitCompletedInteractions = (int) record.interactions().stream()
                            .filter(interaction -> "VISIT_COMPLETED".equals(interaction.type()))
                            .count();
                    int negotiationInteractions = (int) record.interactions().stream()
                            .filter(interaction -> "NEGOTIATION_STARTED".equals(interaction.type()))
                            .count();

                    return new ProspectPropertyInsightResponse(
                            record.propertyId(),
                            record.propertyTitle(),
                            record.relationStatus(),
                            record.interactions().size(),
                            favoriteInteractions,
                            visitRequestedInteractions,
                            visitCompletedInteractions,
                            negotiationInteractions,
                            record.documents().size(),
                            (int) requestMeetingsCount,
                            (int) confirmedMeetingsCount,
                            (int) completedMeetingsCount,
                            record.updatedAt()
                    );
                })
                .toList();
    }

    private void refreshLeadScoreQuietly(Integer prospectId) {
        try {
            leadScoreService.predict(prospectId);
        } catch (Exception ignored) {
        }
    }
}
