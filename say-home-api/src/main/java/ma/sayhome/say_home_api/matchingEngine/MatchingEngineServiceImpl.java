package ma.sayhome.say_home_api.matchingEngine;

import ma.sayhome.say_home_api.property.PropertyServiceImpl;
import ma.sayhome.say_home_api.property.dto.PropertyDTO;
import ma.sayhome.say_home_api.user.User;
import ma.sayhome.say_home_api.user.UserRepository;
import ma.sayhome.say_home_api.user.dto.UserDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import ma.sayhome.say_home_api.shared.exceptions.BadRequestException;
import tools.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class MatchingEngineServiceImpl implements MatchingEngineService {
    @Value("${ai.server.url}")
    private String aiServerUrl;

    private final PropertyServiceImpl propertyService;
    private final UserRepository userRepository;
    private final RestClient restClient = RestClient.create();

    public MatchingEngineServiceImpl(PropertyServiceImpl propertyService, UserRepository userRepository) {
        this.propertyService = propertyService;
        this.userRepository = userRepository;
    }

    @Override
    public List<SearchEngineResult> fetchMatchingProperties(SearchRequest request) {
        String url = aiServerUrl + "/search/match"
                + "?query=" + (request.getTitle() != null ? request.getTitle() : "")
                + "&type=" + (request.getType() != null ? request.getType() : "")
                + "&secteur=" + (request.getSecteur() != null ? request.getSecteur() : "")
                + "&minPrice=" + (request.getMinPrice() != null ? request.getMinPrice() : "")
                + "&maxPrice=" + (request.getMaxPrice() != null ? request.getMaxPrice() : "");

        if (request.getTitle() == "" && request.getSecteur() == "" && request.getMinPrice() == 0 && request.getMaxPrice() == 0) {
            List<SearchEngineResult> fetchResults = new ArrayList<>();
            for (PropertyDTO propertyDTO : propertyService.findAll()) {
                fetchResults.add(new SearchEngineResult(propertyDTO, 0f));
            }
            return fetchResults;
        }

        String res = restClient.get()
                .uri(url)
                .retrieve()
                .body(String.class);

        SearchEngineResult[] results;
        try {
            ObjectMapper mapper = new ObjectMapper();
            results = mapper.readValue(res, SearchEngineResult[].class);
        } catch (Exception ex) {
            throw new BadRequestException("Unable to parse matching engine response");
        }

        for (SearchEngineResult result : results) {
            propertyService.assingMedia(result.getProperty());
            Optional<User> agent = userRepository.findById(result.getProperty().getAgent_id());
            agent.ifPresent(value -> result.getProperty().setAgent(UserDTO.toDTO(value)));
        }

        return results != null ? List.of(results) : List.of();
    }
}
