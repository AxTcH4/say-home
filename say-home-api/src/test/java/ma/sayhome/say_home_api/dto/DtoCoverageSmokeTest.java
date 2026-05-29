package ma.sayhome.say_home_api.dto;

import ma.sayhome.say_home_api.appointment.Appointment;
import ma.sayhome.say_home_api.appointment.dto.AppointmentRequestToAgent;
import ma.sayhome.say_home_api.dashboard.dto.DashboardProfileResponse;
import ma.sayhome.say_home_api.dashboard.dto.DashboardStatsResponse;
import ma.sayhome.say_home_api.dashboard.dto.DashboardSummaryResponse;
import ma.sayhome.say_home_api.property.Property;
import ma.sayhome.say_home_api.property.dto.PropertyDTO;
import ma.sayhome.say_home_api.property.dto.PropertyReqDTO;
import ma.sayhome.say_home_api.shared.enums.AppointmentStatus;
import ma.sayhome.say_home_api.shared.enums.PropertyOfferType;
import ma.sayhome.say_home_api.shared.enums.PropertySecteur;
import ma.sayhome.say_home_api.shared.enums.PropertyStatus;
import ma.sayhome.say_home_api.shared.enums.PropertyType;
import ma.sayhome.say_home_api.shared.enums.Role;
import ma.sayhome.say_home_api.user.User;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DtoCoverageSmokeTest {

    @Test
    void dashboardDtos_shouldExposeConfiguredValues() {
        DashboardProfileResponse profile = new DashboardProfileResponse(1, "Aya", "Stone", "aya@sayhome.ma", "0600");
        DashboardSummaryResponse summary = new DashboardSummaryResponse(2, 3, 4, 5);
        DashboardStatsResponse stats = new DashboardStatsResponse();

        stats.setTotalProspects(8);
        stats.setAvailableProperties(5);
        stats.setReservedProperties(1);
        stats.setSoldProperties(2);
        stats.setTotalProperties(8);
        stats.setOpenTickets(3);
        stats.setTotalTickets(4);
        stats.setConversionRate(25.0);
        stats.setMonthlyThisYear(List.of(1L, 2L));
        stats.setMonthlyLastYear(List.of(3L, 4L));
        stats.setHotProspects(List.of(new DashboardStatsResponse.HotProspect("Nora", "West", 900_000F, 88F)));
        stats.setRecentTickets(List.of(new DashboardStatsResponse.RecentTicket(9, "Title", "Desc", "HIGH", "OPEN", "now")));

        assertEquals("Aya", profile.getFirstName());
        assertEquals(2, summary.getBoughtProperties());
        assertEquals(25.0, stats.getConversionRate());
        assertEquals("Nora", stats.getHotProspects().get(0).getFirstName());
        assertEquals("Title", stats.getRecentTickets().get(0).getTitle());
    }

    @Test
    void propertyDtos_shouldMapEntitiesBothWays() {
        PropertyReqDTO request = new PropertyReqDTO(
                "Villa", "Sea view", PropertyType.VILLA, PropertySecteur.PALMERAIE, 2_500_000F,
                null, 320, 5, 4, true, null, false, true, null, true, "Agent", null
        );

        Property entity = PropertyReqDTO.toEntity(request);
        assertEquals(PropertyOfferType.SALE, entity.getOfferType());
        assertTrue(entity.getClimatisation());
        assertTrue(entity.getGarage());
        assertEquals(PropertyStatus.AVAILABLE, entity.getStatus());

        User agent = new User();
        agent.setId(4);
        agent.setFirstName("John");
        agent.setLastName("Doe");
        agent.setRole(Role.AGENT);

        entity.setId(99);
        entity.setAgent(agent);
        PropertyDTO dto = PropertyDTO.toDTO(entity);
        assertEquals(99, dto.getId());
        assertNotNull(dto.getAgent());
    }

    @Test
    void appointmentRequestToAgent_shouldMapAppointment() {
        User agent = new User();
        agent.setId(5);
        agent.setFirstName("Mia");
        agent.setLastName("Hart");
        agent.setRole(Role.AGENT);

        Property property = new Property();
        property.setId(7);
        property.setTitle("Loft");
        property.setType(PropertyType.APPARTEMENT);
        property.setSecteur(PropertySecteur.GUELIZ);
        property.setPrice(750_000F);
        property.setOfferType(PropertyOfferType.RENT);
        property.setStatus(PropertyStatus.AVAILABLE);
        property.setAgent(agent);

        Appointment appointment = new Appointment();
        appointment.setId(3);
        appointment.setAgent(agent);
        appointment.setProperty(property);
        appointment.setDate(LocalDateTime.of(2026, 5, 17, 14, 30));
        appointment.setMeetingType("VISIT");
        appointment.setNotes("Bring documents");
        appointment.setStatus(AppointmentStatus.SCHEDULED);

        AppointmentRequestToAgent dto = AppointmentRequestToAgent.toDTO(appointment);

        assertEquals(3, dto.getId());
        assertEquals("Mia Hart", dto.getAgentName());
        assertEquals("Loft", dto.getProperty().getTitle());
        assertEquals(AppointmentStatus.SCHEDULED, dto.getStatus());
    }
}
