package ma.sayhome.say_home_api.leadScore;

import ma.sayhome.say_home_api.leadScore.dto.LeadScorePredictionResponse;
import ma.sayhome.say_home_api.leadScore.dto.LeadScoreRefreshResponse;
import ma.sayhome.say_home_api.shared.ControllerBase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lead-scores")
@PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
public class LeadScoreController extends ControllerBase {
    private final LeadScoreService leadScoreService;

    public LeadScoreController(LeadScoreService leadScoreService) {
        this.leadScoreService = leadScoreService;
    }

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ok(leadScoreService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return ok(leadScoreService.findById(id));
    }

    @GetMapping("/prospect/{prospectId}")
    public ResponseEntity<?> getByProspect(@PathVariable Integer prospectId) {
        return ok(leadScoreService.findByProspectId(prospectId));
    }

    @PostMapping("/predict/{prospectId}")
    public ResponseEntity<LeadScorePredictionResponse> predict(@PathVariable Integer prospectId) {
        return ResponseEntity.ok(leadScoreService.predict(prospectId));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LeadScoreRefreshResponse> refresh() {
        return ResponseEntity.ok(leadScoreService.refreshAll());
    }
}
