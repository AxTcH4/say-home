package ma.sayhome.say_home_api.dashboard;

import ma.sayhome.say_home_api.shared.ControllerBase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController extends ControllerBase {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable Integer userId) {
        return ok(dashboardService.getProfile(userId));
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<?> updateProfile(
            @PathVariable Integer userId,
            @RequestBody DashboardProfileUpdateRequest request) {
        return ok(dashboardService.updateProfile(userId, request));
    }

    @GetMapping("/summary/{userId}")
    public ResponseEntity<?> getSummary(@PathVariable Integer userId) {
        return ok(dashboardService.getSummary(userId));
    }
}
