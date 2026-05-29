package ma.sayhome.say_home_api.matchingEngine;

import ma.sayhome.say_home_api.property.PropertyServiceImpl;
import ma.sayhome.say_home_api.property.dto.PropertyDTO;
import ma.sayhome.say_home_api.shared.enums.PropertySecteur;
import ma.sayhome.say_home_api.shared.enums.PropertyType;
import ma.sayhome.say_home_api.user.User;
import ma.sayhome.say_home_api.user.UserRepository;
import ma.sayhome.say_home_api.user.dto.UserDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;
import ma.sayhome.say_home_api.shared.exceptions.BadRequestException;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.JsonNode;
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
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(aiServerUrl + "/search/match")
                .queryParam("query", request.getTitle() != null ? request.getTitle() : "")
                .queryParam("type", request.getType() != null ? request.getType() : "")
                .queryParam("secteur", request.getSecteur() != null ? request.getSecteur() : "")
                .queryParam("minPrice", request.getMinPrice() != null ? request.getMinPrice() : "")
                .queryParam("maxPrice", request.getMaxPrice() != null ? request.getMaxPrice() : "")
                .queryParam("minSurface", request.getMinSurface() != null ? request.getMinSurface() : "")
                .queryParam("minRooms", request.getMinRooms() != null ? request.getMinRooms() : "");

        String url = builder.toUriString();

        if ((request.getTitle() == null || request.getTitle().isEmpty())
                && (request.getSecteur() == null || request.getSecteur().isEmpty())
                && (request.getMinPrice() == null || request.getMinPrice() == 0)
                && (request.getMaxPrice() == null || request.getMaxPrice() == 0)) {
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

        List<SearchEngineResult> results;
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(res);
            results = parseResults(root);
        } catch (Exception ex) {
            throw new BadRequestException("Unable to parse matching engine response");
        }

        for (SearchEngineResult result : results) {
            propertyService.assingMedia(result.getProperty());
            Optional<User> agent = userRepository.findById(result.getProperty().getAgent_id());
            agent.ifPresent(value -> result.getProperty().setAgent(UserDTO.toDTO(value)));
        }

        return results;
    }

    private List<SearchEngineResult> parseResults(JsonNode root) {
        if (root == null || !root.isArray()) {
            throw new IllegalArgumentException("Matching engine response must be an array");
        }

        List<SearchEngineResult> results = new ArrayList<>();
        for (JsonNode item : root) {
            JsonNode propertyNode = item.path("property");
            if (propertyNode.isMissingNode() || propertyNode.isNull()) {
                continue;
            }

            PropertyDTO property = new PropertyDTO();
            property.setId(asInteger(propertyNode.get("id")));
            property.setTitle(asText(propertyNode.get("title")));
            property.setDescription(asText(propertyNode.get("description")));
            property.setType(parsePropertyType(asText(propertyNode.get("type"))));
            property.setSecteur(parsePropertySecteur(asText(propertyNode.get("secteur"))));
            property.setPrice(asFloat(propertyNode.get("price")));
            property.setSurface(asInteger(propertyNode.get("surface")));
            property.setRooms(asInteger(propertyNode.get("rooms")));
            property.setAgent_id(asInteger(propertyNode.get("agent_id")));

            Float score = asFloat(item.get("score"));
            results.add(new SearchEngineResult(property, score != null ? score : 0f));
        }

        return results;
    }

    private String asText(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        return node.asText();
    }

    private Integer asInteger(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        return node.asInt();
    }

    private Float asFloat(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        return (float) node.asDouble();
    }

    private PropertyType parsePropertyType(String value) {
        try {
            return PropertyType.fromStorageValue(value);
        } catch (Exception ignored) {
            return null;
        }
    }

    private PropertySecteur parsePropertySecteur(String value) {
        try {
            return PropertySecteur.fromStorageValue(value);
        } catch (Exception ignored) {
            return null;
        }
    }
}
