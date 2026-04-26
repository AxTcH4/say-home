package ma.sayhome.say_home_api.notification;

import ma.sayhome.say_home_api.auth.User;
import ma.sayhome.say_home_api.auth.UserRepository;
import ma.sayhome.say_home_api.notification.dto.NotificationResponse;
import ma.sayhome.say_home_api.shared.enums.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class NotificationServiceImp implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Override
    public void createNotification(String message, User user) {
        Notification notification = new Notification();
        notification.setMessage(message);
        notification.setUser(user);
        notification.setIs_read(false);
        notificationRepository.save(notification);

        NotificationResponse notificationResponse = NotificationResponse.toDTO(notification);
        System.out.println("Notification created");
        messagingTemplate.convertAndSend(
                "/topic/notifications/" + user.getId(),
                notificationResponse
        );
    }

    @Override
    public void createNotificationsForRole(String message, Role role) {
        List<User> users = userRepository.findByRole(Role.valueOf(role.toString()));
        for (User user : users) {
            createNotification(message, user);
        }
    }

    @Override
    public List<NotificationResponse> getNotificationsForUser(User user) {
        List<NotificationResponse> notificationResponseList = new ArrayList<>();
        for(Notification notification : notificationRepository.findByUserOrderByCreatedAtDesc(user)){
            NotificationResponse notificationResponse = NotificationResponse.toDTO(notification);
            notificationResponseList.add(notificationResponse);
        }
    return notificationResponseList;
    }

    @Override
    public void markAsRead(Integer notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIs_read(true);
        notificationRepository.save(notification);
    }

    @Override
    @Scheduled(cron = "0 0 0 * * ?") // runs every day at midnight
    public void deleteOldNotifications() {
        LocalDateTime threeMonthsAgo = LocalDateTime.now().minusMonths(3);
        notificationRepository.deleteByCreatedAtBefore(threeMonthsAgo);
    }
}