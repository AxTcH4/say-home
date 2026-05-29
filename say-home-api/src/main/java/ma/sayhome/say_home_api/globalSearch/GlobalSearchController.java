package ma.sayhome.say_home_api.globalSearch;

import ma.sayhome.say_home_api.globalSearch.dto.SearchResponse;
import ma.sayhome.say_home_api.shared.ApiResponse;
import ma.sayhome.say_home_api.shared.ControllerBase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/search")
@PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
public class GlobalSearchController extends ControllerBase {
    @Autowired
    private GlobalSearchService globalSearchService;

    @GetMapping
    public ResponseEntity<ApiResponse<SearchResponse>> getGlobalSearchProperties(@RequestParam ("keyword") String keyword) throws ExecutionException, InterruptedException {
        //forward to service
        return ok(globalSearchService.findRelatedItems(keyword));
    }
}
