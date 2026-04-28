package ma.sayhome.say_home_api.pipeline;

import ma.sayhome.say_home_api.auth.User;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.prospect.ProspectRepository;
import ma.sayhome.say_home_api.shared.enums.ProspectStatus;
import ma.sayhome.say_home_api.shared.enums.Role;
import ma.sayhome.say_home_api.pipeline.dto.PipelineBoardResponse;
import ma.sayhome.say_home_api.pipeline.dto.PipelineCardResponse;
import ma.sayhome.say_home_api.pipeline.dto.PipelineColumnResponse;
import ma.sayhome.say_home_api.pipeline.dto.PipelineFiltersResponse;
import org.apache.catalina.Pipeline;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class PipelineServiceImp implements PipelineService {
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final ProspectRepository prospectRepository;
    private final PipelineStageRepository pipelineStageRepository;

    public PipelineServiceImp(ProspectRepository prospectRepository, PipelineStageRepository pipelineStageRepository) {
        this.prospectRepository = prospectRepository;
        this.pipelineStageRepository = pipelineStageRepository;
    }

    public PipelineBoardResponse getBoard(String assignedAgent, String city, String source) {
        assertAdmin();
        List<Prospect> prospects = prospectRepository.findAll().stream()
                .filter(prospect -> matchesAssignedAgent(prospect, assignedAgent))
                .filter(prospect -> matchesCity(prospect, city))
                .filter(prospect -> matchesSource(prospect, source))
                .toList();

        Map<ProspectStatus, PipelineColumnResponse> columns = new LinkedHashMap<>();
        columns.put(ProspectStatus.NEW, emptyColumn("NEW", "New Lead", "#85a5ff"));
        columns.put(ProspectStatus.CONTACTED, emptyColumn("CONTACTED", "Contacted", "#7b8cff"));
        columns.put(ProspectStatus.QUALIFIED, emptyColumn("QUALIFIED", "Visit Scheduled", "#f1b84b"));
        columns.put(ProspectStatus.NEGOTIATING, emptyColumn("NEGOTIATING", "Negotiation", "#5bc28c"));
        columns.put(ProspectStatus.CONVERTED, emptyColumn("CONVERTED", "Won", "#54d2b5"));
        columns.put(ProspectStatus.LOST, emptyColumn("LOST", "Lost", "#f16d7a"));

        for (Prospect prospect : prospects) {
            ProspectStatus status = prospect.getStatus() == null ? ProspectStatus.NEW : prospect.getStatus();
            PipelineColumnResponse current = columns.get(status);
            List<PipelineCardResponse> nextProspects = new ArrayList<>(current.prospects());
            nextProspects.add(toCard(prospect));
            nextProspects.sort(Comparator.comparing(PipelineCardResponse::fullName));
            columns.put(status, new PipelineColumnResponse(
                    current.key(),
                    current.title(),
                    nextProspects.size(),
                    current.color(),
                    nextProspects
            ));
        }

        PipelineFiltersResponse filters = new PipelineFiltersResponse(
                prospectRepository.findAll().stream()
                        .map(Prospect::getAssignedAgent)
                        .filter(Objects::nonNull)
                        .map(agent -> agent.getFirstName() + " " + agent.getLastName())
                        .distinct()
                        .sorted()
                        .toList(),
                prospectRepository.findAll().stream()
                        .map(Prospect::getCity)
                        .filter(value -> value != null && !value.isBlank())
                        .distinct()
                        .sorted()
                        .toList(),
                prospectRepository.findAll().stream()
                        .map(Prospect::getSource)
                        .filter(value -> value != null && !value.isBlank())
                        .distinct()
                        .sorted()
                        .toList()
        );

        return new PipelineBoardResponse(new ArrayList<>(columns.values()), filters, DATE_TIME_FORMATTER.format(LocalDateTime.now()));
    }

    public PipelineBoardResponse updateProspectStatus(Integer prospectId, String status) {
        assertAdmin();
        if (status == null || status.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
        }

        Prospect prospect = prospectRepository.findById(prospectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prospect not found"));

        ProspectStatus nextStatus;
        try {
            nextStatus = ProspectStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid pipeline status");
        }

        prospect.setStatus(nextStatus);
        prospectRepository.save(prospect);
        return getBoard(null, null, null);
    }

    @Override
    public Pipeline create(Pipeline entity) {
        return null;
    }

    @Override
    public Pipeline findById(Integer integer) {
        return null;
    }

    @Override
    public List<Pipeline> findAll() {
        return List.of();
    }

    @Override
    public Pipeline update(Integer integer, Pipeline entity) {
        return null;
    }

    @Override
    public void delete(Integer integer) {
    }

    private void assertAdmin() {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (currentUser.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can manage pipeline");
        }
    }

    private boolean matchesAssignedAgent(Prospect prospect, String assignedAgent) {
        return assignedAgent == null || assignedAgent.isBlank()
                || (prospect.getAssignedAgent() != null
                && (prospect.getAssignedAgent().getFirstName() + " " + prospect.getAssignedAgent().getLastName())
                .equalsIgnoreCase(assignedAgent));
    }

    private boolean matchesCity(Prospect prospect, String city) {
        return city == null || city.isBlank()
                || (prospect.getCity() != null && prospect.getCity().equalsIgnoreCase(city));
    }

    private boolean matchesSource(Prospect prospect, String source) {
        return source == null || source.isBlank()
                || (prospect.getSource() != null && prospect.getSource().equalsIgnoreCase(source));
    }

    private PipelineColumnResponse emptyColumn(String key, String title, String color) {
        return new PipelineColumnResponse(key, title, 0, color, List.of());
    }

    private PipelineCardResponse toCard(Prospect prospect) {
        return new PipelineCardResponse(
                prospect.getId(),
                prospect.getFirstName() + " " + prospect.getLastName(),
                prospect.getCity() == null ? "" : prospect.getCity(),
                formatBudget(prospect.getBudget()),
                0,
                prospect.getAssignedAgent() != null ? prospect.getAssignedAgent().getFirstName() + " " + prospect.getAssignedAgent().getLastName() : null,
                prospect.getStatus() != null ? prospect.getStatus().name() : ProspectStatus.NEW.name()
        );
    }

    private String formatBudget(Float budget) {
        if (budget == null) return "Not specified";
        if (budget >= 1_000_000) {
            return String.format("%.1fM", budget / 1_000_000f);
        }
        return String.format("%.0fk", budget / 1_000f);
    }
}
