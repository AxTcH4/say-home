package ma.sayhome.say_home_api.interaction;

import ma.sayhome.say_home_api.shared.ApiResponse;
import ma.sayhome.say_home_api.shared.ControllerBase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interactions")
public class MatchingInteractionController extends ControllerBase {

    @Autowired
    private MatchingInteractionRepository repository;

    record SearchCriteria(
            String type,
            String secteur,
            Double minPrice,
            Double maxPrice,
            Double minSurface,
            Double minRooms
    ) {}

    record LogShownRequest(List<Integer> propertyIds, SearchCriteria criteria) {}
    record LogClickedRequest(Integer propertyId, SearchCriteria criteria) {}

    @PostMapping("/shown")
    public ResponseEntity<ApiResponse<Void>> logShown(@RequestBody LogShownRequest req) {
        if (req.propertyIds() == null || req.propertyIds().isEmpty()) {
            return ok(null);
        }
        for (Integer propertyId : req.propertyIds()) {
            MatchingInteraction row = new MatchingInteraction();
            row.setPropertyId(propertyId);
            applySearch(row, req.criteria());
            row.setInteracted(false);
            repository.save(row);
        }
        return ok(null);
    }

    @PostMapping("/clicked")
    public ResponseEntity<ApiResponse<Void>> logClicked(@RequestBody LogClickedRequest req) {
        MatchingInteraction row = new MatchingInteraction();
        row.setPropertyId(req.propertyId());
        applySearch(row, req.criteria());
        row.setInteracted(true);
        repository.save(row);
        return ok(null);
    }

    private void applySearch(MatchingInteraction row, SearchCriteria c) {
        if (c == null) return;
        row.setSearchType(c.type());
        row.setSearchSecteur(c.secteur());
        row.setSearchMinPrice(c.minPrice());
        row.setSearchMaxPrice(c.maxPrice());
        row.setSearchMinSurface(c.minSurface());
        row.setSearchMinRooms(c.minRooms());
    }
}
