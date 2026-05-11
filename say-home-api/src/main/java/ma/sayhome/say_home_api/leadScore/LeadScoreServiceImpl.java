package ma.sayhome.say_home_api.leadScore;

import ma.sayhome.say_home_api.leadScore.dto.LeadScorePredictionResponse;
import ma.sayhome.say_home_api.leadScore.dto.LeadScoreRefreshResponse;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.prospect.ProspectRepository;
import ma.sayhome.say_home_api.shared.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class LeadScoreServiceImpl implements LeadScoreService {
    private final LeadScoreRepository leadScoreRepository;
    private final ProspectRepository prospectRepository;

    public LeadScoreServiceImpl(LeadScoreRepository leadScoreRepository, ProspectRepository prospectRepository) {
        this.leadScoreRepository = leadScoreRepository;
        this.prospectRepository = prospectRepository;
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

        Map<String, Float> breakdown = buildBreakdown(prospect);
        float score = breakdown.values().stream().reduce(0f, Float::sum);
        String classification = classify(score);

        LeadScore leadScore = new LeadScore();
        leadScore.setProspect(prospect);
        leadScore.setScore(score);
        leadScoreRepository.save(leadScore);

        return new LeadScorePredictionResponse(prospectId, score, classification, breakdown, true);
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

    private Map<String, Float> buildBreakdown(Prospect prospect) {
        Map<String, Float> breakdown = new LinkedHashMap<>();
        breakdown.put("budget", scoreBudget(prospect.getBudget()));
        breakdown.put("phone", prospect.getPhone() != null && !prospect.getPhone().isBlank() ? 15f : 0f);
        breakdown.put("city", prospect.getCity() != null && !prospect.getCity().isBlank() ? 10f : 0f);
        breakdown.put("source", prospect.getSource() != null && !prospect.getSource().isBlank() ? 10f : 0f);
        breakdown.put("account", prospect.getUser() != null ? 15f : 0f);
        return breakdown;
    }

    private float scoreBudget(Float budget) {
        if (budget == null) {
            return 0f;
        }
        if (budget >= 3_000_000f) {
            return 50f;
        }
        if (budget >= 1_500_000f) {
            return 35f;
        }
        if (budget >= 750_000f) {
            return 20f;
        }
        return 10f;
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
