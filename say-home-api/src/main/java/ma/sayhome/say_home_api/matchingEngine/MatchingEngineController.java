package ma.sayhome.say_home_api.matchingEngine;

import jakarta.validation.Valid;
import ma.sayhome.say_home_api.matchingEngine.matchResult.MatchResult;
import ma.sayhome.say_home_api.shared.ApiResponse;
import ma.sayhome.say_home_api.shared.ControllerBase;
import ma.sayhome.say_home_api.shared.exceptions.BadRequestException;
import ma.sayhome.say_home_api.shared.exceptions.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class MatchingEngineController extends ControllerBase {
    @Autowired
    private MatchingEngineServiceImp matchingEngineService;

    @GetMapping("/api/properties/search")
    @CrossOrigin(origins = "http://localhost:3000")
    //search for attributes and similar
    //create a percentage column
    //sort by percentage

    //sanitize inputs
    public ResponseEntity<ApiResponse<List<SearchEngineResult>>> search (@Valid @ModelAttribute SearchRequest request) {
        if (request.getTitle() != null ) {
            request.setTitle(request.getTitle().trim().toLowerCase());
        }

        if (request.getMinPrice() != null && request.getMaxPrice() != null ) {
            if (request.getMinPrice() > request.getMaxPrice() && request.getMaxPrice() != 0 ) {
                throw new BadRequestException("Min price cannot be greater than max price");}
            }

            //forward request to FASTAPI
            List<SearchEngineResult> result = matchingEngineService.fetchMatchingProperties(request);
            MatchResult matchResult = new MatchResult();

        if (result == null || result.isEmpty()) {
            throw new ResourceNotFoundException("Aucun resultat");
        }



            //construct a match result
            //store result in match result and send back to front

        return ok(result);

    }
}




