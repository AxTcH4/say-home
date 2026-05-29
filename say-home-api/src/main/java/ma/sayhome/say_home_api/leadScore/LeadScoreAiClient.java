package ma.sayhome.say_home_api.leadScore;

import ma.sayhome.say_home_api.leadScore.dto.LeadScoreAiRequest;
import ma.sayhome.say_home_api.leadScore.dto.LeadScoreAiResponse;
import ma.sayhome.say_home_api.shared.exceptions.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class LeadScoreAiClient {
    private final RestClient restClient = RestClient.create();

    @Value("${ai.server.url}")
    private String aiServerUrl;

    public LeadScoreAiResponse predict(LeadScoreAiRequest request) {
        LeadScoreAiResponse response = restClient.post()
                .uri(aiServerUrl + "/lead-score/predict")
                .body(request)
                .retrieve()
                .body(LeadScoreAiResponse.class);

        if (response == null) {
            throw new BadRequestException("Lead score AI response is empty");
        }

        return response;
    }
}
