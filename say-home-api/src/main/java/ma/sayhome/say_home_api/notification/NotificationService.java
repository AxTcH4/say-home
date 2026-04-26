package ma.sayhome.say_home_api.notification;

import ma.sayhome.say_home_api.auth.User;
import ma.sayhome.say_home_api.notification.dto.NotificationResponse;
import ma.sayhome.say_home_api.shared.enums.Role;

import java.util.List;

public interface NotificationService {
    void createNotification(String message, User user);
    void createNotificationsForRole(String message, Role role);
    List<NotificationResponse> getNotificationsForUser(User user);
    void markAsRead(Integer notificationId);
    void deleteOldNotifications();
}