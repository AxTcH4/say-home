package ma.sayhome.say_home_api.notification;

import ma.sayhome.say_home_api.auth.User;
import ma.sayhome.say_home_api.notification.dto.NotificationResponse;
import ma.sayhome.say_home_api.shared.ApiResponse;
import ma.sayhome.say_home_api.shared.ControllerBase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController extends ControllerBase {

    @Autowired
    private NotificationServiceImp notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications() {
        System.out.println("getNotifications");
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ok(notificationService.getNotificationsForUser(user));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Boolean>> markAsRead(@PathVariable Integer id) {
        notificationService.markAsRead(id);
        return ok(true);
    }
}