package ma.sayhome.say_home_api.prospect;

import ma.sayhome.say_home_api.user.User;
import ma.sayhome.say_home_api.user.UserRepository;
import ma.sayhome.say_home_api.pipeline.PipelineStage;
import ma.sayhome.say_home_api.pipeline.PipelineStageRepository;
import ma.sayhome.say_home_api.prospect.dto.CreateProspectInteractionRequest;
import ma.sayhome.say_home_api.prospect.dto.CreateProspectRequest;
import ma.sayhome.say_home_api.prospect.dto.ProspectDetailResponse;
import ma.sayhome.say_home_api.prospect.dto.ProspectFeedbackResponse;
import ma.sayhome.say_home_api.prospect.dto.ProspectFiltersResponse;
import ma.sayhome.say_home_api.prospect.dto.ProspectInteractionResponse;
import ma.sayhome.say_home_api.prospect.dto.ProspectListItemResponse;
import ma.sayhome.say_home_api.prospect.dto.ProspectListResponse;
import ma.sayhome.say_home_api.prospect.dto.ProspectMeetingResponse;
import ma.sayhome.say_home_api.prospect.interaction.ProspectInteraction;
import ma.sayhome.say_home_api.prospect.interaction.ProspectInteractionRepository;
import ma.sayhome.say_home_api.prospectProperty.ProspectPropertyRecordService;
import ma.sayhome.say_home_api.shared.enums.ProspectStatus;
import ma.sayhome.say_home_api.shared.enums.Role;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
public class ProspectServiceImpl implements ProspectService {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    private final ProspectRepository prospectRepository;
    private final UserRepository userRepository;
    private final PipelineStageRepository pipelineStageRepository;
    private final ProspectInteractionRepository prospectInteractionRepository;
    private final ProspectPropertyRecordService prospectPropertyRecordService;

    public ProspectServiceImpl(
            ProspectRepository prospectRepository,
            UserRepository userRepository,
            PipelineStageRepository pipelineStageRepository,
            ProspectInteractionRepository prospectInteractionRepository,
            ProspectPropertyRecordService prospectPropertyRecordService
    ) {
        this.prospectRepository = prospectRepository;
        this.userRepository = userRepository;
        this.pipelineStageRepository = pipelineStageRepository;
        this.prospectInteractionRepository = prospectInteractionRepository;
        this.prospectPropertyRecordService = prospectPropertyRecordService;
    }

    public ProspectListResponse getProspects(String search, String status, String assignedAgent, String source) {
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

        ProspectFiltersResponse filters = new ProspectFiltersResponse(
                prospectRepository.findAll().stream().map(Prospect::getStatus).filter(Objects::nonNull).map(Enum::name).distinct().sorted().toList(),
                prospectRepository.findAll().stream().map(Prospect::getAssignedAgent).filter(Objects::nonNull).map(User::getFullName).distinct().sorted().toList(),
                prospectRepository.findAll().stream().map(Prospect::getSource).filter(value -> value != null && !value.isBlank()).distinct().sorted().toList()
        );

        return new ProspectListResponse(items, items.size(), 1, items.size() == 0 ? 10 : items.size(), filters);
    }

    public ProspectDetailResponse getProspectDetail(Integer id) {
        assertAdmin();
        Prospect prospect = getRequiredProspect(id);

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

        return new ProspectDetailResponse(
                prospect.getId(),
                effectiveFullName(prospect),
                effectiveEmail(prospect),
                effectivePhone(prospect),
                safeValue(prospect.getCity()),
                formatBudgetLabel(prospect.getBudget()),
                prospect.getBudget(),
                prospect.getStatus().name(),
                0,
                safeValue(prospect.getSource()),
                prospect.getAssignedAgent() != null ? prospect.getAssignedAgent().getFullName() : null,
                "Not specified",
                formatDate(prospect.getCreatedAt()),
                "",
                "COLD",
                interactions,
                List.<ProspectMeetingResponse>of(),
                List.<ProspectFeedbackResponse>of(),
                prospectPropertyRecordService.getRecordsByProspectId(id)
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
        return new ProspectListItemResponse(
                prospect.getId(),
                effectiveFullName(prospect),
                effectiveEmail(prospect),
                effectivePhone(prospect),
                safeValue(prospect.getCity()),
                formatBudgetLabel(prospect.getBudget()),
                prospect.getStatus().name(),
                0,
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

        return userRepository.findById(assignedAgentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assigned agent not found"));
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
}
