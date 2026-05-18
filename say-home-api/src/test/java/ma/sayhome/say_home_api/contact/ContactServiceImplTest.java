package ma.sayhome.say_home_api.contact;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import ma.sayhome.say_home_api.shared.exceptions.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContactServiceImplTest {

    @Mock
    private JavaMailSender mailSender;

    private ContactServiceImpl contactService;

    @BeforeEach
    void setUp() {
        contactService = new ContactServiceImpl(mailSender);
    }

    @Test
    void sendContact_shouldRejectMissingName() {
        ContactRequest request = new ContactRequest();
        request.email = "client@sayhome.ma";
        request.message = "Bonjour";

        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> contactService.sendContact(request)
        );

        assertEquals("Name is required", exception.getMessage());
    }

    @Test
    void sendContact_shouldReturnSuccessEvenIfMailSendingFails() {
        ContactRequest request = new ContactRequest();
        request.name = "Alice";
        request.email = "alice@sayhome.ma";
        request.message = "Je souhaite plus d'informations";

        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new MailSendException("smtp down")).when(mailSender).send(any(MimeMessage.class));

        ContactResponse response = contactService.sendContact(request);

        assertEquals("Message sent successfully", response.getMessage());
        verify(mailSender).createMimeMessage();
        verify(mailSender).send(any(MimeMessage.class));
    }
}
