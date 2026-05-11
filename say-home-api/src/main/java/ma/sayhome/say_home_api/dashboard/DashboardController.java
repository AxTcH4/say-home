package ma.sayhome.say_home_api.dashboard;

import ma.sayhome.say_home_api.dashboard.dto.DashboardProfileUpdateRequest;
import ma.sayhome.say_home_api.shared.ControllerBase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class DashboardController extends ControllerBase {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/profile/{userId}")
    @PreAuthorize("#userId == authentication.principal.id or hasRole('ADMIN')")
    public ResponseEntity<?> getProfile(@PathVariable Integer userId) {
        return ok(dashboardService.getProfile(userId));
    }

    @PutMapping("/profile/{userId}")
    @PreAuthorize("#userId == authentication.principal.id or hasRole('ADMIN')")
    public ResponseEntity<?> updateProfile(
            @PathVariable Integer userId,
            @RequestBody DashboardProfileUpdateRequest request) {
        return ok(dashboardService.updateProfile(userId, request));
    }

    @GetMapping("/summary/{userId}")
    @PreAuthorize("#userId == authentication.principal.id or hasRole('ADMIN')")
    public ResponseEntity<?> getSummary(@PathVariable Integer userId) {
        return ok(dashboardService.getSummary(userId));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<?> getStats() {
        return ok(dashboardService.getStats());
    }
}
