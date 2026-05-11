package ma.sayhome.say_home_api.prospect;

import ma.sayhome.say_home_api.prospect.dto.CreateProspectInteractionRequest;
import ma.sayhome.say_home_api.prospect.dto.CreateProspectRequest;
import ma.sayhome.say_home_api.shared.ControllerBase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/prospects")
@PreAuthorize("hasRole('ADMIN')")
public class ProspectController extends ControllerBase {
    private final ProspectServiceImpl prospectService;

    public ProspectController(ProspectServiceImpl prospectService) {
        this.prospectService = prospectService;
    }

    @GetMapping
    public ResponseEntity<?> getProspects(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String assignedAgent,
            @RequestParam(required = false) String source
    ) {
        return ok(prospectService.getProspects(search, status, assignedAgent, source));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProspectById(@PathVariable Integer id) {
        return ok(prospectService.getProspectDetail(id));
    }

    @PostMapping
    public ResponseEntity<?> createProspect(@RequestBody CreateProspectRequest request) {
        return created(prospectService.createProspect(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProspect(@PathVariable Integer id, @RequestBody CreateProspectRequest request) {
        return ok(prospectService.updateProspect(id, request));
    }

    @PostMapping("/{id}/interactions")
    public ResponseEntity<?> addInteraction(@PathVariable Integer id, @RequestBody CreateProspectInteractionRequest request) {
        return ok(prospectService.addInteraction(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProspect(@PathVariable Integer id) {
        prospectService.delete(id);
        return noContent();
    }
}
