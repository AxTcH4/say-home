package ma.sayhome.say_home_api.property;

import ma.sayhome.say_home_api.property.dto.PropertyDTO;
import ma.sayhome.say_home_api.shared.enums.PropertySecteur;
import ma.sayhome.say_home_api.shared.enums.PropertyType;
import ma.sayhome.say_home_api.shared.exceptions.GlobalHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PropertyControllerTest {

    private PropertyRepository propertyRepository;
    private PropertyServiceImpl propertyService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        propertyRepository = mock(PropertyRepository.class);
        propertyService = mock(PropertyServiceImpl.class);
        mockMvc = MockMvcBuilders
                .standaloneSetup(new PropertyController(propertyRepository, propertyService))
                .setControllerAdvice(new GlobalHandler())
                .build();
    }

    @Test
    void getLatestProperties_shouldUseTypeFilterWhenProvided() throws Exception {
        Property property = buildProperty(1, "Villa Atlas", PropertyType.VILLA, PropertySecteur.PALMERAIE);
        when(propertyRepository.findByTypeOrderByCreatedAtDesc(PropertyType.VILLA)).thenReturn(List.of(property));

        mockMvc.perform(get("/api/properties/latest").param("type", "villa"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].title").value("Villa Atlas"));

        verify(propertyRepository).findByTypeOrderByCreatedAtDesc(PropertyType.VILLA);
        verify(propertyService).assingMedia(any(PropertyDTO.class));
    }

    @Test
    void getPropertyById_shouldReturn404WhenMissing() throws Exception {
        when(propertyRepository.findById(99)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/properties/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Property with id 99 not found"));
    }

    private Property buildProperty(int id, String title, PropertyType type, PropertySecteur secteur) {
        Property property = new Property();
        property.setId(id);
        property.setTitle(title);
        property.setType(type);
        property.setSecteur(secteur);
        property.setPrice(2000000f);
        property.setSurface(250);
        property.setRooms(4);
        return property;
    }
}
