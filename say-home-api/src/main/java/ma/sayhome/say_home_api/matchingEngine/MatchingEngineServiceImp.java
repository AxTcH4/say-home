package ma.sayhome.say_home_api.matchingEngine;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@Service
public class MatchingEngineServiceImp implements MatchingEngineService {
    @Value("${ai.server.url}")
    private String aiServerUrl;

    private final RestClient restClient = RestClient.create();


    @Override
    public List<SearchEngineResult> fetchMatchingProperties(SearchRequest request) {
        String url = aiServerUrl + "/search/match"
                + "?query=" + (request.getTitle() != null ? request.getTitle() : "")
                + "&type=" + (request.getType() != null ? request.getType() : "")
                + "&secteur=" + (request.getSecteur() != null ? request.getSecteur() : "")
                + "&minPrice=" + (request.getMinPrice() != null ? request.getMinPrice() : "")
                + "&maxPrice=" + (request.getMaxPrice() != null ? request.getMaxPrice() : "");
        String res = restClient.get()
                .uri(url)
                .retrieve()
                .body(String.class);

        System.out.println("res = " + res);

            ObjectMapper mapper = new ObjectMapper();
            SearchEngineResult[] results = mapper.readValue(res, SearchEngineResult[].class);




        return results != null ? List.of(results) : List.of();
    }
}
