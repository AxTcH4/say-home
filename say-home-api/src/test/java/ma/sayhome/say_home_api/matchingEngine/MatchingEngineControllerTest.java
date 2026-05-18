package ma.sayhome.say_home_api.matchingEngine;

import ma.sayhome.say_home_api.shared.exceptions.GlobalHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class MatchingEngineControllerTest {

    private MatchingEngineServiceImpl matchingEngineService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        matchingEngineService = mock(MatchingEngineServiceImpl.class);
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders
                .standaloneSetup(new MatchingEngineController(matchingEngineService))
                .setControllerAdvice(new GlobalHandler())
                .setValidator(validator)
                .build();
    }

    @Test
    void search_shouldTrimAndLowercaseQueryBeforeDelegating() throws Exception {
        SearchEngineResult result = new SearchEngineResult(new ma.sayhome.say_home_api.property.dto.PropertyDTO(), 0.7f);
        when(matchingEngineService.fetchMatchingProperties(any(SearchRequest.class))).thenReturn(List.of(result));

        mockMvc.perform(get("/api/properties/search").param("title", "  Villa Luxe  "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(matchingEngineService).fetchMatchingProperties(argThat(request ->
                "villa luxe".equals(request.getTitle())
        ));
    }

    @Test
    void search_shouldRejectMinPriceGreaterThanMaxPrice() throws Exception {
        mockMvc.perform(get("/api/properties/search")
                        .param("minPrice", "900")
                        .param("maxPrice", "100"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Min price cannot be greater than max price"));
    }

    @Test
    void search_shouldRejectInvalidTypeValue() throws Exception {
        mockMvc.perform(get("/api/properties/search").param("type", "castle"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Type Invalide"));
    }
}
