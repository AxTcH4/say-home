package ma.sayhome.say_home_api.helpDesk;

import ma.sayhome.say_home_api.helpDesk.dto.ChatMessageRequest;
import ma.sayhome.say_home_api.helpDesk.dto.MessageResponse;
import ma.sayhome.say_home_api.helpDesk.dto.TicketDTO;
import ma.sayhome.say_home_api.helpDesk.dto.TicketRequest;
import ma.sayhome.say_home_api.shared.enums.Role;
import ma.sayhome.say_home_api.shared.enums.Sender;
import ma.sayhome.say_home_api.user.User;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class HelpDeskControllerTest {

    private HelpDeskServiceImp helpDeskService;
    private HelpDeskController controller;

    @BeforeEach
    void setUp() {
        helpDeskService = mock(HelpDeskServiceImp.class);
        controller = new HelpDeskController();
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "helpDeskService", helpDeskService);

        User user = new User();
        user.setId(22);
        user.setEmail("client@sayhome.ma");
        user.setRole(Role.CLIENT);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities())
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void create_shouldUseAuthenticatedUser() throws Exception {
        MessageResponse response = new MessageResponse();
        response.setMessageSent(true);
        ChatMessageRequest request = new ChatMessageRequest();
        request.setContent("Bonjour");
        request.setSender(Sender.PROSPECT);
        when(helpDeskService.handleSendingMessage(any(User.class), eq(request))).thenReturn(response);

        var entity = controller.create(request);

        assertTrue(entity.getBody().isSuccess());
        verify(helpDeskService).handleSendingMessage(argThat(user -> user.getId().equals(22)), eq(request));
    }

    @Test
    void getMyTickets_shouldDelegateToAuthenticatedProspect() {
        TicketDTO ticket = new TicketDTO();
        ticket.setId(3);
        when(helpDeskService.getTicketsByAuthenticatedProspect(any(User.class))).thenReturn(List.of(ticket));

        var entity = controller.getMyTickets();

        assertTrue(entity.getBody().isSuccess());
        assertEquals(1, ((List<?>) entity.getBody().getData()).size());
    }

    @Test
    void createTicket_shouldReturnCreated() {
        TicketRequest request = new TicketRequest();
        request.setTitle("Need help");
        TicketDTO response = new TicketDTO();
        response.setId(8);
        when(helpDeskService.createTicket(request)).thenReturn(response);

        var entity = controller.createTicket(request);

        assertEquals(201, entity.getStatusCode().value());
        assertEquals(8, ((TicketDTO) entity.getBody().getData()).getId());
    }
}
