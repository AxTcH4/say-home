package ma.sayhome.say_home_api.interaction;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class MatchingInteractionControllerTest {

    private MatchingInteractionRepository repository;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        repository = mock(MatchingInteractionRepository.class);
        MatchingInteractionController controller = new MatchingInteractionController();
        ReflectionTestUtils.setField(controller, "repository", repository);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void logShown_shouldPersistEachPropertyId() throws Exception {
        mockMvc.perform(post("/api/interactions/shown")
                        .contentType("application/json")
                        .content("""
                                {"propertyIds":[1,2],"criteria":{"type":"villa","minPrice":1000}}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(repository, times(2)).save(any(MatchingInteraction.class));
    }

    @Test
    void logClicked_shouldPersistInteractionAsClicked() throws Exception {
        mockMvc.perform(post("/api/interactions/clicked")
                        .contentType("application/json")
                        .content("""
                                {"propertyId":5,"criteria":{"secteur":"targa"}}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(repository).save(argThat(interaction ->
                interaction.getPropertyId().equals(5) && Boolean.TRUE.equals(interaction.getInteracted())
        ));
    }
}
