package ma.sayhome.say_home_api.contact;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import ma.sayhome.say_home_api.shared.exceptions.BadRequestException;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class ContactServiceImp implements ContactService {

    private static final String SAY_HOME_EMAIL = "sayhome.app@gmail.com";

    private final JavaMailSender mailSender;

    public ContactServiceImp(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public ContactResponse sendContact(ContactRequest request) {

        if (request.name == null || request.name.trim().isEmpty()) {
            throw new BadRequestException("Name is required");
        }

        if (request.email == null || request.email.trim().isEmpty()) {
            throw new BadRequestException("Email is required");
        }

        if (request.message == null || request.message.trim().isEmpty()) {
            throw new BadRequestException("Message is required");
        }

        try {
            sendHtmlEmail(
                    SAY_HOME_EMAIL,
                    request.email,
                    "Nouveau message de contact - Say Home",
                    buildContactEmail(request)
            );
        } catch (MailException | MessagingException ex) {
            System.err.println("Contact email could not be sent: " + ex.getMessage());
        }

        return new ContactResponse("Message sent successfully");
    }

    private void sendHtmlEmail(String to, String replyTo, String subject, String html) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
        helper.setFrom(SAY_HOME_EMAIL);
        helper.setTo(to);
        helper.setReplyTo(replyTo);
        helper.setSubject(subject);
        helper.setText(html, true);
        mailSender.send(message);
    }

    private String buildContactEmail(ContactRequest request) {
        return """
                <!doctype html>
                <html>
                  <body style="margin:0;padding:0;background:#f5f5f3;font-family:Arial,Helvetica,sans-serif;color:#222222;">
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:#f5f5f3;padding:32px 12px;">
                      <tr>
                        <td align="center">
                          <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e3ded8;">
                            <tr>
                              <td style="background:#2f1b10;padding:26px 32px;text-align:center;">
                                <div style="font-size:26px;font-weight:800;letter-spacing:3px;color:#ffffff;text-transform:uppercase;">Say Home</div>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:34px;">
                                <p style="margin:0 0 8px 0;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#8b6b55;font-weight:700;">Nouveau contact</p>
                                <h1 style="margin:0 0 24px 0;font-size:28px;line-height:1.25;color:#222222;font-weight:700;">Un visiteur vous a envoye un message</h1>
                                <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:24px;">
                                  <tr>
                                    <td style="padding:14px 16px;background:#f8f6f2;border:1px solid #ebe4dc;font-size:14px;color:#777777;width:120px;">Nom</td>
                                    <td style="padding:14px 16px;border:1px solid #ebe4dc;font-size:14px;color:#222222;font-weight:700;">%s</td>
                                  </tr>
                                  <tr>
                                    <td style="padding:14px 16px;background:#f8f6f2;border:1px solid #ebe4dc;font-size:14px;color:#777777;width:120px;">Email</td>
                                    <td style="padding:14px 16px;border:1px solid #ebe4dc;font-size:14px;"><a href="mailto:%s" style="color:#2f1b10;text-decoration:none;font-weight:700;">%s</a></td>
                                  </tr>
                                </table>
                                <div style="padding:20px 22px;background:#f8f6f2;border-left:4px solid #2f1b10;">
                                  <p style="margin:0;font-size:15px;line-height:1.8;color:#333333;white-space:pre-line;">%s</p>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td style="background:#f1eee9;padding:18px 32px;text-align:center;font-size:12px;color:#777777;">
                                Recu depuis le formulaire de contact - sayhome.app@gmail.com
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                """.formatted(
                escapeHtml(request.name),
                escapeHtml(request.email),
                escapeHtml(request.email),
                escapeHtml(request.message)
        );
    }

    private String escapeHtml(String value) {
        return value == null ? "" : value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
