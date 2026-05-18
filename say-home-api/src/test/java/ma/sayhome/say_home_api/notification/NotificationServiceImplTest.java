package ma.sayhome.say_home_api.notification;

import ma.sayhome.say_home_api.notification.dto.NotificationResponse;
import ma.sayhome.say_home_api.shared.enums.Role;
import ma.sayhome.say_home_api.user.User;
import ma.sayhome.say_home_api.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    private NotificationServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new NotificationServiceImpl();
        ReflectionTestUtils.setField(service, "notificationRepository", notificationRepository);
        ReflectionTestUtils.setField(service, "userRepository", userRepository);
        ReflectionTestUtils.setField(service, "messagingTemplate", messagingTemplate);
    }

    @Test
    void createNotification_shouldPersistAndPublish() {
        User user = buildUser(12, "agent@sayhome.ma", Role.AGENT);
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> {
            Notification notification = invocation.getArgument(0);
            notification.setId(45);
            notification.setCreatedAt(LocalDateTime.now());
            return notification;
        });

        service.createNotification("A new lead arrived", user);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        assertEquals("A new lead arrived", captor.getValue().getMessage());
        assertFalse(captor.getValue().getIs_read());
        verify(messagingTemplate).convertAndSend(eq("/topic/notifications/12"), any(NotificationResponse.class));
    }

    @Test
    void getNotificationsForUser_shouldMapRepositoryResults() {
        User user = buildUser(12, "agent@sayhome.ma", Role.AGENT);
        Notification notification = new Notification();
        notification.setId(8);
        notification.setMessage("Ping");
        notification.setUser(user);
        notification.setIs_read(false);
        notification.setCreatedAt(LocalDateTime.now());
        when(notificationRepository.findByUserOrderByCreatedAtDesc(user)).thenReturn(List.of(notification));

        List<NotificationResponse> results = service.getNotificationsForUser(user);

        assertEquals(1, results.size());
        assertEquals("Ping", results.get(0).getMessage());
    }

    @Test
    void markAsRead_shouldUpdateNotificationState() {
        Notification notification = new Notification();
        notification.setId(3);
        notification.setIs_read(false);
        when(notificationRepository.findById(3)).thenReturn(Optional.of(notification));

        service.markAsRead(3);

        assertTrue(notification.getIs_read());
        verify(notificationRepository).save(notification);
    }

    @Test
    void deleteOldNotifications_shouldDeleteRowsOlderThanThreeMonths() {
        service.deleteOldNotifications();

        verify(notificationRepository).deleteByCreatedAtBefore(any(LocalDateTime.class));
    }

    private User buildUser(int id, String email, Role role) {
        User user = new User();
        user.setId(id);
        user.setFirstName("Say");
        user.setLastName("Home");
        user.setEmail(email);
        user.setRole(role);
        user.setActive(true);
        return user;
    }
}
