package ma.sayhome.say_home_api.leadScore;

import ma.sayhome.say_home_api.leadScore.dto.LeadScorePredictionResponse;
import ma.sayhome.say_home_api.leadScore.dto.LeadScoreRefreshResponse;
import ma.sayhome.say_home_api.shared.ServiceBase;

import java.util.List;

public interface LeadScoreService extends ServiceBase<LeadScore, Integer> {
    LeadScorePredictionResponse predict(Integer prospectId);
    LeadScoreSummary getLatestOrPredictSummary(Integer prospectId);
    LeadScoreRefreshResponse refreshAll();
    List<LeadScore> findByProspectId(Integer prospectId);
}
