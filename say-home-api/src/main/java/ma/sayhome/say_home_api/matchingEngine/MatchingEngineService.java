package ma.sayhome.say_home_api.matchingEngine;


import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.ModelAttribute;

import java.util.List;

public interface MatchingEngineService {
    public List<SearchEngineResult> fetchMatchingProperties(@Valid @ModelAttribute SearchRequest request);
}
