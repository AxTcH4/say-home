package ma.sayhome.say_home_api.wish;

import ma.sayhome.say_home_api.appointment.Appointment;
import ma.sayhome.say_home_api.appointment.AppointmentRepository;
import ma.sayhome.say_home_api.property.Property;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.shared.enums.PropertyOfferType;
import ma.sayhome.say_home_api.shared.enums.PropertySecteur;
import ma.sayhome.say_home_api.shared.enums.PropertyType;
import ma.sayhome.say_home_api.shared.enums.WantedPropertySource;
import ma.sayhome.say_home_api.shared.exceptions.BadRequestException;
import ma.sayhome.say_home_api.wish.dto.SubmitProspectWishRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class WantedPropertyServiceTest {

    private WantedPropertyRepository wantedPropertyRepository;
    private AppointmentRepository appointmentRepository;
    private WantedPropertyService service;

    @BeforeEach
    void setUp() {
        wantedPropertyRepository = mock(WantedPropertyRepository.class);
        appointmentRepository = mock(AppointmentRepository.class);
        service = new WantedPropertyService(
                wantedPropertyRepository,
                appointmentRepository,
                mock(JavaMailSender.class)
        );
    }

    @Test
    void submit_shouldRejectAlreadySubmittedWish() {
        WantedProperty existing = new WantedProperty();
        existing.setSubmitted(true);
        when(wantedPropertyRepository.findByToken("wish-token")).thenReturn(Optional.of(existing));

        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> service.submit("wish-token", new SubmitProspectWishRequest())
        );

        assertEquals("Wish already submitted", exception.getMessage());
    }

    @Test
    void submit_shouldNormalizeStudioAmenities() {
        Prospect prospect = new Prospect();
        prospect.setFirstName("Alice");
        prospect.setLastName("Doe");

        Appointment appointment = new Appointment();
        appointment.setProspect(prospect);

        when(wantedPropertyRepository.findByToken("wish-token")).thenReturn(Optional.empty());
        when(appointmentRepository.findByWishRequestToken("wish-token")).thenReturn(Optional.of(appointment));
        when(wantedPropertyRepository.save(any(WantedProperty.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SubmitProspectWishRequest request = new SubmitProspectWishRequest();
        request.type = "studio";
        request.piscine = true;
        request.jardin = true;
        request.garage = true;

        service.submit("wish-token", request);

        verify(wantedPropertyRepository).save(argThat(wish ->
                wish.getType() == PropertyType.STUDIO
                        && wish.getPiscine() == null
                        && wish.getJardin() == null
                        && wish.getGarage() == null
        ));
    }

    @Test
    void createFromAgreement_shouldDeriveWishCriteriaFromProperty() {
        Prospect prospect = new Prospect();
        prospect.setFirstName("Nora");
        prospect.setLastName("Stone");

        Property property = new Property();
        property.setTitle("Palm Villa");
        property.setType(PropertyType.VILLA);
        property.setSecteur(PropertySecteur.PALMERAIE);
        property.setOfferType(PropertyOfferType.SALE);
        property.setPrice(2_000_000F);
        property.setSurface(300);
        property.setRooms(5);
        property.setBathrooms(4);
        property.setPiscine(true);
        property.setJardin(true);
        property.setGarage(true);
        property.setSecurite(true);

        Appointment appointment = new Appointment();
        appointment.setProspect(prospect);
        appointment.setProperty(property);

        when(wantedPropertyRepository.save(any(WantedProperty.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WantedProperty wish = service.createFromAgreement(appointment);

        assertEquals(WantedPropertySource.AGREEMENT, wish.getSource());
        assertTrue(wish.isSubmitted());
        assertEquals(1_800_000F, wish.getMinPrice());
        assertEquals(2_200_000F, wish.getMaxPrice());
        assertEquals(PropertyType.VILLA, wish.getType());
        assertEquals(Boolean.TRUE, wish.getPiscine());
    }

    @Test
    void getPublicForm_shouldReturnSubmittedWishWhenTokenExists() {
        Prospect prospect = new Prospect();
        prospect.setFirstName("Aya");
        prospect.setLastName("Hart");

        Property property = new Property();
        property.setTitle("Garden Loft");

        WantedProperty wish = new WantedProperty();
        wish.setToken("wish-token");
        wish.setProspect(prospect);
        wish.setReferenceProperty(property);
        wish.setSubmitted(true);

        when(wantedPropertyRepository.findByToken("wish-token")).thenReturn(Optional.of(wish));

        var response = service.getPublicForm("wish-token");

        assertEquals("Aya Hart", response.prospectName());
        assertEquals("Garden Loft", response.propertyTitle());
        assertTrue(response.submitted());
    }

    @Test
    void findByProspectId_shouldBuildReadableSummary() {
        Property property = new Property();
        property.setTitle("Reference Villa");

        Prospect prospect = new Prospect();
        prospect.setFirstName("Lina");
        prospect.setLastName("West");

        WantedProperty wish = new WantedProperty();
        wish.setId(7);
        wish.setProspect(prospect);
        wish.setReferenceProperty(property);
        wish.setSource(WantedPropertySource.FORM);
        wish.setSubmitted(true);
        wish.setOfferType(PropertyOfferType.RENT);
        wish.setType(PropertyType.APPARTEMENT);
        wish.setSecteur(PropertySecteur.GUELIZ);
        wish.setMinPrice(10_000F);
        wish.setMaxPrice(15_000F);
        wish.setClimatisation(true);

        when(wantedPropertyRepository.findByProspectIdOrderByCreatedAtDesc(3)).thenReturn(List.of(wish));

        var results = service.findByProspectId(3);

        assertEquals(1, results.size());
        assertTrue(results.get(0).summary().contains("A louer"));
        assertTrue(results.get(0).summary().contains("Appartement"));
        assertTrue(results.get(0).summary().contains("Gueliz"));
        assertTrue(results.get(0).summary().contains("Climatisation"));
    }
}
