package ma.sayhome.say_home_api.property;

import ma.sayhome.say_home_api.appointment.AppointmentRepository;
import ma.sayhome.say_home_api.matchingEngine.matchResult.MatchResultRepository;
import ma.sayhome.say_home_api.notification.NotificationService;
import ma.sayhome.say_home_api.property.dto.PropertyDTO;
import ma.sayhome.say_home_api.property.dto.PropertyReqDTO;
import ma.sayhome.say_home_api.property.propertyMedia.PropertyMediaServiceImpl;
import ma.sayhome.say_home_api.prospectProperty.ProspectPropertyRecordRepository;
import ma.sayhome.say_home_api.prospectProperty.ProspectPropertyRecordService;
import ma.sayhome.say_home_api.shared.enums.PropertyOfferType;
import ma.sayhome.say_home_api.shared.enums.PropertySecteur;
import ma.sayhome.say_home_api.shared.enums.PropertyType;
import ma.sayhome.say_home_api.user.UserRepository;
import ma.sayhome.say_home_api.wish.PropertyRecommendationRepository;
import ma.sayhome.say_home_api.wish.PropertyRecommendationService;
import ma.sayhome.say_home_api.wish.WantedPropertyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PropertyServiceImplTest {

    private PropertyRepository propertyRepository;
    private PropertyMediaServiceImpl propertyMediaService;
    private PropertyServiceImpl service;

    @BeforeEach
    void setUp() {
        propertyRepository = mock(PropertyRepository.class);
        propertyMediaService = mock(PropertyMediaServiceImpl.class);
        service = new PropertyServiceImpl(
                propertyRepository,
                propertyMediaService,
                mock(UserRepository.class),
                mock(NotificationService.class),
                mock(PropertyRecommendationService.class),
                mock(ProspectPropertyRecordRepository.class),
                mock(ProspectPropertyRecordService.class),
                mock(PropertyRecommendationRepository.class),
                mock(WantedPropertyRepository.class),
                mock(AppointmentRepository.class),
                mock(MatchResultRepository.class)
        );
    }

    @Test
    void update_shouldNormalizeAmenitiesForStudio() {
        Property existing = new Property();
        existing.setId(12);
        existing.setTitle("Old");
        existing.setType(PropertyType.VILLA);
        existing.setSecteur(PropertySecteur.TARGA);
        existing.setPrice(3000000f);
        existing.setOfferType(PropertyOfferType.SALE);
        existing.setSurface(220);
        existing.setRooms(4);
        existing.setBathrooms(3);
        existing.setPiscine(true);
        existing.setJardin(true);
        existing.setGarage(true);

        when(propertyRepository.findById(12)).thenReturn(Optional.of(existing));
        when(propertyRepository.save(any(Property.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PropertyReqDTO request = new PropertyReqDTO();
        request.setTitle("Studio Medina");
        request.setDescription("Compact");
        request.setType(PropertyType.STUDIO);
        request.setSecteur(PropertySecteur.MEDINA);
        request.setPrice(850000f);
        request.setOfferType(PropertyOfferType.SALE);
        request.setSurface(48);
        request.setRooms(1);
        request.setBathrooms(1);
        request.setPiscine(true);
        request.setJardin(true);
        request.setGarage(true);

        PropertyDTO result = service.update(12, request);

        assertEquals(PropertyType.STUDIO, result.getType());
        assertFalse(existing.getPiscine());
        assertFalse(existing.getJardin());
        assertFalse(existing.getGarage());
        verify(propertyMediaService).getByPropertyId(12);
    }
}
