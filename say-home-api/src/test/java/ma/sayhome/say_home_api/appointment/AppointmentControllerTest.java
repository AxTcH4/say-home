package ma.sayhome.say_home_api.appointment;

import ma.sayhome.say_home_api.shared.exceptions.GlobalHandler;
import ma.sayhome.say_home_api.user.User;
import ma.sayhome.say_home_api.appointment.dto.AppointmentsBoardResponse;
import ma.sayhome.say_home_api.appointment.dto.ClientVisitRequestResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AppointmentControllerTest {

    private AppointmentServiceImpl appointmentService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        appointmentService = mock(AppointmentServiceImpl.class);
        mockMvc = MockMvcBuilders
                .standaloneSetup(new AppointmentController(appointmentService))
                .setControllerAdvice(new GlobalHandler())
                .build();

        User user = new User();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, List.of())
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getBoard_shouldReturnWrappedBoard() throws Exception {
        when(appointmentService.getBoard()).thenReturn(new AppointmentsBoardResponse("This week", List.of(), List.of()));

        mockMvc.perform(get("/api/appointments/board"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentRangeLabel").value("This week"));
    }

    @Test
    void createVisitRequest_shouldReturnCreated() throws Exception {
        when(appointmentService.createVisitRequest(any())).thenReturn(
                new ClientVisitRequestResponse(9, 12, "Villa Atlas", "2026-05-20", "10:00", "Visite", null, "REQUESTED", "Agent Test")
        );

        mockMvc.perform(post("/api/appointments/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"propertyId":12,"date":"2026-05-20","time":"10:00","message":"Visite"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").value(9))
                .andExpect(jsonPath("$.data.status").value("REQUESTED"));
    }
}
