package ma.sayhome.say_home_api.contact;

import ma.sayhome.say_home_api.shared.exceptions.GlobalHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ContactControllerTest {

    private ContactService contactService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        contactService = mock(ContactService.class);
        mockMvc = MockMvcBuilders
                .standaloneSetup(new ContactController(contactService))
                .setControllerAdvice(new GlobalHandler())
                .build();
    }

    @Test
    void sendMessage_shouldWrapResponseInApiEnvelope() throws Exception {
        when(contactService.sendContact(any(ContactRequest.class)))
                .thenReturn(new ContactResponse("Message sent successfully"));

        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Alice","email":"alice@sayhome.ma","message":"Bonjour"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.message").value("Message sent successfully"));
    }
}
