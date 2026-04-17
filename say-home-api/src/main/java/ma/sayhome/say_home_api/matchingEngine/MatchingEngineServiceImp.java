package ma.sayhome.say_home_api.matchingEngine;

import ma.sayhome.say_home_api.auth.User;
import ma.sayhome.say_home_api.auth.UserRepository;
import ma.sayhome.say_home_api.auth.dto.UserDTO;
import ma.sayhome.say_home_api.property.PropertyServiceImp;
import ma.sayhome.say_home_api.property.dto.PropertyDTO;
import ma.sayhome.say_home_api.property.propertyMedia.PropertyMediaServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class MatchingEngineServiceImp implements MatchingEngineService {
    @Value("${ai.server.url}")
    private String aiServerUrl;

    @Autowired
    private PropertyServiceImp propertyService;

    @Autowired
    private UserRepository userRepository;



    private final RestClient restClient = RestClient.create();

    @Override
    public List<SearchEngineResult> fetchMatchingProperties(SearchRequest request) {
        String url = aiServerUrl + "/search/match"
                + "?query=" + (request.getTitle() != null ? request.getTitle() : "")
                + "&type=" + (request.getType() != null ? request.getType() : "")
                + "&secteur=" + (request.getSecteur() != null ? request.getSecteur() : "")
                + "&minPrice=" + (request.getMinPrice() != null ? request.getMinPrice() : "")
                + "&maxPrice=" + (request.getMaxPrice() != null ? request.getMaxPrice() : "");


        if (request.getTitle() == "" && request.getSecteur() == "" && request.getMinPrice() == 0 && request.getMaxPrice() == 0) {
            System.out.println("Not using FASTAPI server");
            //forward request to property service
            List<PropertyDTO> properties = propertyService.findAll();
            //map results as search engine results
            List<SearchEngineResult> fetchResults = new ArrayList<>();
            for (PropertyDTO propertyDTO : properties) {
                System.out.println(propertyDTO.toString());
//                find agents for properties
                ;
                    SearchEngineResult result = new SearchEngineResult(propertyDTO, Float.parseFloat(String.valueOf(0.0)));
                    fetchResults.add(result);

            }
            return fetchResults;
        }

            String res = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(String.class);

            //Map the result with DTO adn send it back to controller

//            System.out.println("Raw Results = " + res);

            //Deserialize raw JSON  (jackson)
            ObjectMapper mapper = new ObjectMapper();
            SearchEngineResult[] results = mapper.readValue(res, SearchEngineResult[].class);

            //for each property: find medias associated, get agent by id
            for (SearchEngineResult r : results) {
//                System.out.println(r.getClass());
                propertyService.assingMedia(r.getProperty());
//            find agents for properties
                Optional<User> agent = userRepository.findById(r.getProperty().getAgent_id());

//            assing agent
                if (agent.isPresent()) {
                    r.getProperty().setAgent(UserDTO.toDTO(agent.get()));
                }
            }


            return results != null ? List.of(results) : List.of();
        }


    }


