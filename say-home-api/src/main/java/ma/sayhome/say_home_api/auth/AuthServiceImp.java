package ma.sayhome.say_home_api.auth;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import ma.sayhome.say_home_api.auth.dto.*;
import ma.sayhome.say_home_api.shared.ApiResponse;
import ma.sayhome.say_home_api.shared.enums.Role;
import ma.sayhome.say_home_api.shared.exceptions.BadRequestException;
import ma.sayhome.say_home_api.shared.exceptions.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.function.EntityResponse;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthServiceImp implements AuthService {
    @Autowired
    private UserTokenRepository userTokenRepository;

    private static final String SAY_HOME_EMAIL = "sayhome.app@gmail.com";
    private static final String FRONTEND_URL = "http://localhost:3000";

    private final UserRepository userRepository;
    private final PendingRegistrationRepository pendingRegistrationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    public AuthServiceImp(UserRepository userRepository,
                          PendingRegistrationRepository pendingRegistrationRepository,
                          PasswordEncoder passwordEncoder,
                          JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.pendingRegistrationRepository = pendingRegistrationRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    public Integer logout(LogoutRequest logout) {
        //verify token
        if (logout == null || logout.getToken() == null) {

        throw new BadRequestException("Couldnt logout");
    }

    //delete token from db
    int deleted = userTokenRepository.deleteByToken(logout.getToken());

        if (deleted == 0) {
            throw new RuntimeException("couldnt delete token");
        }
        return deleted;

}

    @Override
    public AuthResponse login(LoginRequest request) {
        if (request.email == null || request.email.isBlank())
            throw new BadRequestException("Email is required");
        if (request.password == null || request.password.isBlank())
            throw new BadRequestException("Password is required");

        User user = userRepository.findByEmail(request.email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password, user.getPassword()))
            throw new UnauthorizedException("Invalid email or password");

        String token = UUID.randomUUID().toString();

        //add token to db
        UserToken toke = new UserToken(token, user);
        UserToken userToken = userTokenRepository.save(toke);

        user.setToken(token);
        userRepository.save(user);

        return new AuthResponse("Login successful", token, user);
    }

    @Override
    public AuthResponse signup(RegisterRequest request) {
        if (request.firstName == null || request.firstName.isBlank())
            throw new BadRequestException("First name is required");
        if (request.lastName == null || request.lastName.isBlank())
            throw new BadRequestException("Last name is required");
        if (request.email == null || request.email.isBlank())
            throw new BadRequestException("Email is required");
        if (request.password == null || request.password.isBlank())
            throw new BadRequestException("Password is required");
        if (request.confirmPassword != null && !request.password.equals(request.confirmPassword))
            throw new BadRequestException("Passwords do not match");

        if (userRepository.findByEmail(request.email).isPresent())
            throw new BadRequestException("Email already in use");

        pendingRegistrationRepository.findByEmail(request.email)
                .ifPresent(pendingRegistrationRepository::delete);

        String verificationToken = UUID.randomUUID().toString();

        PendingRegistration pendingRegistration = new PendingRegistration();
        pendingRegistration.setFirstName(request.firstName);
        pendingRegistration.setLastName(request.lastName);
        pendingRegistration.setEmail(request.email);
        pendingRegistration.setPhone(request.phone);
        pendingRegistration.setPassword(passwordEncoder.encode(request.password));
        pendingRegistration.setVerificationToken(verificationToken);
        pendingRegistration.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));

        pendingRegistrationRepository.save(pendingRegistration);
        sendRegistrationVerificationEmail(request.email, verificationToken);

        return new AuthResponse("Verification email sent");
    }


    @Override
    public AuthResponse verifyRegistration(String token) {
        System.out.println("Verifying email");
        if (token == null || token.isBlank())
            throw new BadRequestException("Verification token is required");

        PendingRegistration pendingRegistration = pendingRegistrationRepository.findByVerificationToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid verification token"));

        if (pendingRegistration.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            pendingRegistrationRepository.delete(pendingRegistration);
            throw new BadRequestException("Verification token expired");
        }

        if (userRepository.findByEmail(pendingRegistration.getEmail()).isPresent()) {
            pendingRegistrationRepository.delete(pendingRegistration);
            throw new BadRequestException("Email already in use");
        }

        User user = new User();
        user.setFirstName(pendingRegistration.getFirstName());
        user.setLastName(pendingRegistration.getLastName());
        user.setEmail(pendingRegistration.getEmail());
        user.setPhone(pendingRegistration.getPhone());
        user.setPassword(pendingRegistration.getPassword());
        user.setRole(Role.CLIENT);

        String authToken = UUID.randomUUID().toString();
        user.setToken(authToken);

        userRepository.save(user);
        pendingRegistrationRepository.delete(pendingRegistration);

        return new AuthResponse("Registration verified", authToken, user);
    }

    @Override
    public AuthResponse.UserDto getCurrentUser(String token) {
        if (token == null || token.isBlank())
            throw new UnauthorizedException("Token is required");

        User user = userRepository.findByToken(token)
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired token"));

        return new AuthResponse.UserDto(user);
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        if (request.email == null || request.email.isBlank())
            throw new BadRequestException("Email is required");

        userRepository.findByEmail(request.email).ifPresent(user -> {
            String resetToken = UUID.randomUUID().toString();
            user.setToken(resetToken);
            userRepository.save(user);

            String resetLink = FRONTEND_URL + "/reset-password?token=" + resetToken;

            try {
                sendHtmlEmail(
                        user.getEmail(),
                        "Reinitialisation de mot de passe - Say Home",
                        buildActionEmail(
                                "Reinitialisation du mot de passe",
                                "Bonjour " + user.getFirstName() + ",",
                                "Vous avez demande a reinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.",
                                "Reinitialiser mon mot de passe",
                                resetLink,
                                "Ce lien est personnel. Si vous n'etes pas a l'origine de cette demande, vous pouvez ignorer cet email."
                        )
                );
            } catch (MailException | MessagingException ex) {
                System.err.println("Reset password email could not be sent: " + ex.getMessage());
            }
        });
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        String newPassword = request.getEffectivePassword();

        if (request.token == null || request.token.isBlank())
            throw new BadRequestException("Reset token is required");
        if (newPassword == null || newPassword.isBlank())
            throw new BadRequestException("New password is required");

        User user = userRepository.findByToken(request.token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        user.setPassword(passwordEncoder.encode(newPassword));
        String freshToken = UUID.randomUUID().toString();
        user.setToken(freshToken);
        userRepository.save(user);
    }

    private void sendRegistrationVerificationEmail(String email, String verificationToken) {
        String verificationLink = FRONTEND_URL + "/auth/verify-email?token=" + verificationToken;

        try {
            sendHtmlEmail(
                    email,
                    "Confirmez votre inscription - Say Home",
                    buildActionEmail(
                            "Bienvenue chez Say Home",
                            "Votre compte est presque pret.",
                            "Confirmez votre adresse email pour activer votre compte et acceder a votre espace.",
                            "Confirmer mon inscription",
                            verificationLink,
                            "Ce lien expire dans 24 heures. Si vous n'avez pas cree de compte, vous pouvez ignorer cet email."
                    )
            );
        } catch (MailException | MessagingException ex) {
            throw new BadRequestException("Unable to send verification email");
        }
    }

    private void sendHtmlEmail(String to, String subject, String html) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
        helper.setFrom(SAY_HOME_EMAIL);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        mailSender.send(message);
    }

    private String buildActionEmail(
            String title,
            String greeting,
            String body,
            String buttonText,
            String buttonUrl,
            String footnote
    ) {
        return """
                <!doctype html>
                <html>
                  <body style="margin:0;padding:0;background:#f5f5f3;font-family:Arial,Helvetica,sans-serif;color:#222222;">
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:#f5f5f3;padding:32px 12px;">
                      <tr>
                        <td align="center">
                          <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e3ded8;">
                            <tr>
                              <td style="background:#2f1b10;padding:28px 32px;text-align:center;">
                                <div style="font-size:26px;font-weight:800;letter-spacing:3px;color:#ffffff;text-transform:uppercase;">Say Home</div>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:36px 34px 28px 34px;">
                                <h1 style="margin:0 0 18px 0;font-size:28px;line-height:1.25;color:#222222;font-weight:700;">%s</h1>
                                <p style="margin:0 0 14px 0;font-size:16px;line-height:1.7;color:#333333;">%s</p>
                                <p style="margin:0 0 28px 0;font-size:15px;line-height:1.7;color:#555555;">%s</p>
                                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 28px 0;">
                                  <tr>
                                    <td style="background:#2f1b10;border-radius:4px;">
                                      <a href="%s" style="display:inline-block;padding:14px 22px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">%s</a>
                                    </td>
                                  </tr>
                                </table>
                                <p style="margin:0 0 10px 0;font-size:13px;line-height:1.6;color:#777777;">%s</p>
                                <p style="margin:0;font-size:12px;line-height:1.6;color:#999999;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur:<br><a href="%s" style="color:#2f1b10;">%s</a></p>
                              </td>
                            </tr>
                            <tr>
                              <td style="background:#f1eee9;padding:18px 32px;text-align:center;font-size:12px;color:#777777;">
                                Marrakech, Maroc - sayhome.app@gmail.com
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                """.formatted(title, greeting, body, buttonUrl, buttonText, footnote, buttonUrl, buttonUrl);
    }
    public User findByFullName(String firstName, String lastName) {
        return userRepository.findByFirstNameAndLastName(firstName, lastName);
    }

}
