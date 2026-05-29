package ma.sayhome.say_home_api.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.sayhome.say_home_api.user.dto.UserDTO;
import ma.sayhome.say_home_api.notification.Notification;

import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private int id;

    private String message;

    private Boolean is_read = false;

    private UserDTO user;

    private LocalDateTime createdAt;

    public static NotificationResponse toDTO(Notification notification) {
        NotificationResponse notificationResponse = new NotificationResponse();
        notificationResponse.setId(notification.getId());
        notificationResponse.message = notification.getMessage();
        notificationResponse.is_read = notification.getIs_read();
        notificationResponse.createdAt = notification.getCreatedAt();
        notificationResponse.setUser(UserDTO.toDTO(notification.getUser()));
        return  notificationResponse;
    }
}
