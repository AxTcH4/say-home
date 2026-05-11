package ma.sayhome.say_home_api.matchingEngine;

import jakarta.validation.Valid;
import ma.sayhome.say_home_api.shared.ApiResponse;
import ma.sayhome.say_home_api.shared.ControllerBase;
import ma.sayhome.say_home_api.shared.exceptions.BadRequestException;
import ma.sayhome.say_home_api.shared.exceptions.ResourceNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class MatchingEngineController extends ControllerBase {
    private final MatchingEngineServiceImpl matchingEngineService;

    public MatchingEngineController(MatchingEngineServiceImpl matchingEngineService) {
        this.matchingEngineService = matchingEngineService;
    }

    @GetMapping("/api/properties/search")
    @CrossOrigin(origins = "http://localhost:3000")
    public ResponseEntity<ApiResponse<List<SearchEngineResult>>> search(@Valid @ModelAttribute SearchRequest request) {
        if (request.getTitle() != null) {
            request.setTitle(request.getTitle().trim().toLowerCase());
        }

        if (request.getMinPrice() != null && request.getMaxPrice() != null
                && request.getMinPrice() > request.getMaxPrice() && request.getMaxPrice() != 0) {
            throw new BadRequestException("Min price cannot be greater than max price");
        }

        List<SearchEngineResult> result = matchingEngineService.fetchMatchingProperties(request);
        if (result == null || result.isEmpty()) {
            throw new ResourceNotFoundException("Aucun resultat");
        }

        return ok(result);
    }
}
