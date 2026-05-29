package ma.sayhome.say_home_api.notification;

import ma.sayhome.say_home_api.notification.dto.NotificationResponse;
import ma.sayhome.say_home_api.shared.enums.Role;
import ma.sayhome.say_home_api.user.User;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class NotificationControllerTest {

    private NotificationServiceImpl notificationService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        notificationService = mock(NotificationServiceImpl.class);
        mockMvc = MockMvcBuilders
                .standaloneSetup(new NotificationController(notificationService))
                .build();

        User user = new User();
        user.setId(14);
        user.setEmail("agent@sayhome.ma");
        user.setRole(Role.AGENT);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities())
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getNotifications_shouldUseAuthenticatedPrincipal() throws Exception {
        NotificationResponse response = new NotificationResponse();
        response.setId(3);
        response.setMessage("Welcome");
        when(notificationService.getNotificationsForUser(any(User.class))).thenReturn(List.of(response));

        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].message").value("Welcome"));

        verify(notificationService).getNotificationsForUser(argThat(user -> user.getId().equals(14)));
    }

    @Test
    void markAsRead_shouldDelegateAndReturnTrue() throws Exception {
        mockMvc.perform(patch("/api/notifications/5/read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(true));

        verify(notificationService).markAsRead(5);
    }
}
