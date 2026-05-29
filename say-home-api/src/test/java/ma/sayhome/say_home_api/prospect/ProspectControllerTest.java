package ma.sayhome.say_home_api.prospect;

import ma.sayhome.say_home_api.shared.exceptions.GlobalHandler;
import ma.sayhome.say_home_api.prospect.dto.ProspectDetailResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Map;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ProspectControllerTest {

    private ProspectServiceImpl prospectService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        prospectService = mock(ProspectServiceImpl.class);
        mockMvc = MockMvcBuilders
                .standaloneSetup(new ProspectController(prospectService))
                .setControllerAdvice(new GlobalHandler())
                .build();
    }

    @Test
    void createProspect_shouldReturnCreated() throws Exception {
        when(prospectService.createProspect(any())).thenReturn(
                new ProspectDetailResponse(
                        7, "Alice Doe", "alice@sayhome.ma", null, null, null, null, null,
                        null, null, null, null, null, null, null, null, null, null, null, null, null
                )
        );

        mockMvc.perform(post("/api/prospects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"firstName":"Alice","lastName":"Doe","email":"alice@sayhome.ma"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").value(7));
    }

    @Test
    void deleteProspect_shouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/prospects/4"))
                .andExpect(status().isNoContent());

        verify(prospectService).delete(4);
    }
}
