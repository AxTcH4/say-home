package ma.sayhome.say_home_api.leadScore;

import ma.sayhome.say_home_api.leadScore.dto.LeadScorePredictionResponse;
import ma.sayhome.say_home_api.leadScore.dto.LeadScoreAiRequest;
import ma.sayhome.say_home_api.leadScore.dto.LeadScoreAiResponse;
import ma.sayhome.say_home_api.leadScore.dto.LeadScoreRefreshResponse;
import ma.sayhome.say_home_api.appointment.Appointment;
import ma.sayhome.say_home_api.appointment.AppointmentRepository;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.prospect.ProspectRepository;
import ma.sayhome.say_home_api.prospect.interaction.ProspectInteractionRepository;
import ma.sayhome.say_home_api.prospectProperty.ProspectPropertyRecord;
import ma.sayhome.say_home_api.prospectProperty.ProspectPropertyRecordRepository;
import ma.sayhome.say_home_api.shared.exceptions.ResourceNotFoundException;
import ma.sayhome.say_home_api.shared.enums.AppointmentStatus;
import ma.sayhome.say_home_api.shared.enums.ProspectPropertyStatus;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class LeadScoreServiceImpl implements LeadScoreService {
    private final LeadScoreRepository leadScoreRepository;
    private final ProspectRepository prospectRepository;
    private final ProspectInteractionRepository prospectInteractionRepository;
    private final ProspectPropertyRecordRepository prospectPropertyRecordRepository;
    private final AppointmentRepository appointmentRepository;
    private final LeadScoreAiClient leadScoreAiClient;

    public LeadScoreServiceImpl(
            LeadScoreRepository leadScoreRepository,
            ProspectRepository prospectRepository,
            ProspectInteractionRepository prospectInteractionRepository,
            ProspectPropertyRecordRepository prospectPropertyRecordRepository,
            AppointmentRepository appointmentRepository,
            LeadScoreAiClient leadScoreAiClient
    ) {
        this.leadScoreRepository = leadScoreRepository;
        this.prospectRepository = prospectRepository;
        this.prospectInteractionRepository = prospectInteractionRepository;
        this.prospectPropertyRecordRepository = prospectPropertyRecordRepository;
        this.appointmentRepository = appointmentRepository;
        this.leadScoreAiClient = leadScoreAiClient;
    }

    @Override
    public LeadScore create(LeadScore entity) {
        return leadScoreRepository.save(entity);
    }

    @Override
    public LeadScore findById(Integer integer) {
        return leadScoreRepository.findById(integer)
                .orElseThrow(() -> new ResourceNotFoundException("Lead score not found"));
    }

    @Override
    public List<LeadScore> findAll() {
        return leadScoreRepository.findAll();
    }

    @Override
    public LeadScore update(Integer integer, LeadScore entity) {
        LeadScore existing = findById(integer);
        existing.setScore(entity.getScore());
        existing.setProspect(entity.getProspect());
        return leadScoreRepository.save(existing);
    }

    @Override
    public void delete(Integer integer) {
        LeadScore existing = findById(integer);
        leadScoreRepository.delete(existing);
    }

    @Override
    public LeadScorePredictionResponse predict(Integer prospectId) {
        Prospect prospect = prospectRepository.findById(prospectId)
                .orElseThrow(() -> new ResourceNotFoundException("Prospect not found"));

        return scoreProspect(prospect, true);
    }

    @Override
    public LeadScoreSummary getLatestOrPredictSummary(Integer prospectId) {
        return leadScoreRepository.findTopByProspect_IdOrderByCreatedAtDesc(prospectId)
                .map(score -> new LeadScoreSummary(score.getScore(), classify(score.getScore())))
                .orElseGet(() -> {
                    try {
                        LeadScorePredictionResponse prediction = predict(prospectId);
                        return new LeadScoreSummary(prediction.score(), prediction.classification());
                    } catch (Exception ignored) {
                        return new LeadScoreSummary(0f, "COLD");
                    }
                });
    }

    @Override
    public LeadScoreRefreshResponse refreshAll() {
        int refreshed = 0;
        for (Prospect prospect : prospectRepository.findAll()) {
            predict(prospect.getId());
            refreshed++;
        }
        return new LeadScoreRefreshResponse(refreshed);
    }

    @Override
    public List<LeadScore> findByProspectId(Integer prospectId) {
        return leadScoreRepository.findByProspect_IdOrderByCreatedAtDesc(prospectId);
    }

    private LeadScorePredictionResponse scoreProspect(Prospect prospect, boolean persist) {
        LeadScoreAiRequest aiRequest = buildAiRequest(prospect);
        LeadScoreAiResponse aiResponse = leadScoreAiClient.predict(aiRequest);
        Map<String, Float> breakdown = buildBreakdown(aiRequest);
        float score = Math.max(0f, Math.min(100f, (aiResponse.score() != null ? aiResponse.score() : 0f) * 100f));
        String classification = normalizeClassification(aiResponse.classe(), score);

        if (persist) {
            LeadScore leadScore = leadScoreRepository.findTopByProspect_IdOrderByCreatedAtDesc(prospect.getId())
                    .orElseGet(LeadScore::new);
            leadScore.setProspect(prospect);
            leadScore.setScore(score);
            leadScoreRepository.save(leadScore);
        }

        return new LeadScorePredictionResponse(prospect.getId(), score, classification, breakdown, persist);
    }

    private LeadScoreAiRequest buildAiRequest(Prospect prospect) {
        List<ProspectPropertyRecord> propertyRecords =
                prospectPropertyRecordRepository.findByProspectIdOrderByUpdatedAtDesc(prospect.getId());
        List<Appointment> appointments = prospect.getAppointments() != null ? prospect.getAppointments() : List.of();
        int interactionCount = prospectInteractionRepository.findByProspectIdOrderByCreatedAtDesc(prospect.getId()).size();
        int confirmedMeetings = (int) appointments.stream()
                .filter(appointment -> appointment.getStatus() == AppointmentStatus.SCHEDULED
                        || appointment.getStatus() == AppointmentStatus.COMPLETED)
                .count();
        int favoriteCount = (int) propertyRecords.stream()
                .filter(record -> record.getStatus() == ProspectPropertyStatus.FAVORITE)
                .count();
        int negotiationCount = (int) propertyRecords.stream()
                .filter(record -> record.getStatus() == ProspectPropertyStatus.NEGOTIATING)
                .count();
        float budget = prospect.getBudget() != null ? prospect.getBudget() : 0f;
        float budgetGap = propertyRecords.stream()
                .map(ProspectPropertyRecord::getProperty)
                .filter(property -> property != null && property.getPrice() != null)
                .map(property -> Math.abs(budget - property.getPrice()))
                .min(Float::compareTo)
                .orElse(0f);
        int dossierComplet = propertyRecords.stream()
                .anyMatch(record -> record.getDocuments() != null && !record.getDocuments().isEmpty()) ? 1 : 0;

        return new LeadScoreAiRequest(
                interactionCount,
                0,
                propertyRecords.size(),
                favoriteCount,
                confirmedMeetings,
                interactionCount,
                budget,
                budgetGap,
                negotiationCount,
                dossierComplet
        );
    }

    private Map<String, Float> buildBreakdown(LeadScoreAiRequest request) {
        Map<String, Float> breakdown = new LinkedHashMap<>();
        breakdown.put("nb_interactions", (float) request.nb_interactions());
        breakdown.put("temps_site", (float) request.temps_site());
        breakdown.put("pages_visitees", (float) request.pages_visitees());
        breakdown.put("favoris_count", (float) request.favoris_count());
        breakdown.put("rdv_confirmes", (float) request.rdv_confirmes());
        breakdown.put("messages_envoyes", (float) request.messages_envoyes());
        breakdown.put("budget_prospect", request.budget_prospect());
        breakdown.put("ecart_budget_prix", request.ecart_budget_prix());
        breakdown.put("nb_negociations", (float) request.nb_negociations());
        breakdown.put("dossier_complet", (float) request.dossier_complet());
        return breakdown;
    }

    private String normalizeClassification(String rawClassification, float fallbackScore) {
        if (rawClassification == null || rawClassification.isBlank()) {
            return classify(fallbackScore);
        }

        return switch (rawClassification.trim().toLowerCase()) {
            case "chaud", "hot" -> "HOT";
            case "tiède", "tiede", "warm" -> "WARM";
            case "froid", "cold" -> "COLD";
            default -> classify(fallbackScore);
        };
    }

    private String classify(float score) {
        if (score >= 70f) {
            return "HOT";
        }
        if (score >= 40f) {
            return "WARM";
        }
        return "COLD";
    }
}
