package ma.sayhome.say_home_api.matchingEngine;

import ma.sayhome.say_home_api.property.PropertyServiceImpl;
import ma.sayhome.say_home_api.property.dto.PropertyDTO;
import ma.sayhome.say_home_api.shared.enums.PropertySecteur;
import ma.sayhome.say_home_api.shared.enums.PropertyType;
import ma.sayhome.say_home_api.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchingEngineServiceImplTest {

    @Mock
    private PropertyServiceImpl propertyService;

    @Mock
    private UserRepository userRepository;

    private MatchingEngineServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new MatchingEngineServiceImpl(propertyService, userRepository);
    }

    @Test
    void fetchMatchingProperties_shouldReturnAllPropertiesWhenNoSearchFiltersProvided() {
        PropertyDTO first = new PropertyDTO();
        first.setId(1);
        first.setTitle("Villa Atlas");
        PropertyDTO second = new PropertyDTO();
        second.setId(2);
        second.setTitle("Riad Medina");
        when(propertyService.findAll()).thenReturn(List.of(first, second));

        SearchRequest request = new SearchRequest();

        List<SearchEngineResult> results = service.fetchMatchingProperties(request);

        assertEquals(2, results.size());
        assertEquals(0f, results.get(0).getScore());
        assertEquals("Villa Atlas", results.get(0).getProperty().getTitle());
        verify(propertyService).findAll();
        verifyNoInteractions(userRepository);
    }

    @Test
    void parseResults_shouldMapKnownEnumsAndIgnoreInvalidOnes() throws Exception {
        JsonNode root = new ObjectMapper().readTree("""
                [
                  {
                    "property": {
                      "id": 5,
                      "title": "Villa Atlas",
                      "description": "Bright villa",
                      "type": "villa",
                      "secteur": "palmeraie",
                      "price": 4500000,
                      "surface": 380,
                      "rooms": 5,
                      "agent_id": 3
                    },
                    "score": 0.82
                  },
                  {
                    "property": {
                      "id": 6,
                      "title": "Unknown",
                      "type": "castle",
                      "secteur": "nowhere"
                    },
                    "score": 0.15
                  }
                ]
                """);

        @SuppressWarnings("unchecked")
        List<SearchEngineResult> results = (List<SearchEngineResult>) ReflectionTestUtils.invokeMethod(
                service,
                "parseResults",
                root
        );

        assertNotNull(results);
        assertEquals(2, results.size());
        assertEquals(PropertyType.VILLA, results.get(0).getProperty().getType());
        assertEquals(PropertySecteur.PALMERAIE, results.get(0).getProperty().getSecteur());
        assertNull(results.get(1).getProperty().getType());
        assertNull(results.get(1).getProperty().getSecteur());
    }

    @Test
    void parseResults_shouldRejectNonArrayPayloads() throws Exception {
        JsonNode root = new ObjectMapper().readTree("""
                {"property":{"id":1}}
                """);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> ReflectionTestUtils.invokeMethod(service, "parseResults", root)
        );

        assertEquals("Matching engine response must be an array", exception.getMessage());
    }
}
