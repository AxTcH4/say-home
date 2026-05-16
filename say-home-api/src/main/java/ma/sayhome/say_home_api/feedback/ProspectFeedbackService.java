package ma.sayhome.say_home_api.feedback;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import ma.sayhome.say_home_api.feedback.dto.ProspectFeedbackFormResponse;
import ma.sayhome.say_home_api.feedback.dto.SubmitProspectFeedbackRequest;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.prospect.dto.ProspectFeedbackResponse;
import ma.sayhome.say_home_api.prospectProperty.ProspectPropertyRecord;
import ma.sayhome.say_home_api.shared.enums.FeedbackSentiment;
import ma.sayhome.say_home_api.shared.exceptions.BadRequestException;
import ma.sayhome.say_home_api.shared.exceptions.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class ProspectFeedbackService {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    private final ProspectFeedbackRepository feedbackRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Value("${sayhome.client.url:http://localhost:3000}")
    private String clientBaseUrl;

    public ProspectFeedbackService(
            ProspectFeedbackRepository feedbackRepository,
            JavaMailSender mailSender
    ) {
        this.feedbackRepository = feedbackRepository;
        this.mailSender = mailSender;
    }

    public void requestForRecord(ProspectPropertyRecord record, String contextStatus) {
        ProspectFeedback feedback = new ProspectFeedback();
        feedback.setToken(UUID.randomUUID().toString());
        feedback.setProspect(record.getProspect());
        feedback.setRecord(record);
        feedback.setContextStatus(contextStatus);
        feedback.setPropertyTitle(record.getProperty() != null ? record.getProperty().getTitle() : null);
        feedbackRepository.save(feedback);
        sendFeedbackEmail(feedback);
    }

    public void requestForProspect(Prospect prospect, String contextStatus) {
        ProspectFeedback feedback = new ProspectFeedback();
        feedback.setToken(UUID.randomUUID().toString());
        feedback.setProspect(prospect);
        feedback.setContextStatus(contextStatus);
        feedbackRepository.save(feedback);
        sendFeedbackEmail(feedback);
    }

    public ProspectFeedbackFormResponse getPublicForm(String token) {
        ProspectFeedback feedback = getRequiredFeedback(token);
        return new ProspectFeedbackFormResponse(
                feedback.getToken(),
                feedback.getProspect().getFirstName() + " " + feedback.getProspect().getLastName(),
                feedback.getContextStatus(),
                feedback.getPropertyTitle(),
                feedback.isSubmitted()
        );
    }

    public ProspectFeedbackFormResponse submit(String token, SubmitProspectFeedbackRequest request) {
        ProspectFeedback feedback = getRequiredFeedback(token);
        if (feedback.isSubmitted()) {
            throw new BadRequestException("Feedback already submitted");
        }
        if (request.sentiment == null || request.sentiment.isBlank()) {
            throw new BadRequestException("Feedback sentiment is required");
        }

        FeedbackSentiment sentiment;
        try {
            sentiment = FeedbackSentiment.valueOf(request.sentiment.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid feedback sentiment");
        }

        feedback.setSentiment(sentiment);
        feedback.setComment(request.comment == null ? null : request.comment.trim());
        feedback.setSubmitted(true);
        feedback.setSubmittedAt(LocalDateTime.now());
        feedbackRepository.save(feedback);

        return new ProspectFeedbackFormResponse(
                feedback.getToken(),
                feedback.getProspect().getFirstName() + " " + feedback.getProspect().getLastName(),
                feedback.getContextStatus(),
                feedback.getPropertyTitle(),
                true
        );
    }

    public List<ProspectFeedbackResponse> findByProspectId(Integer prospectId) {
        return feedbackRepository.findByProspectIdOrderByCreatedAtDesc(prospectId).stream()
                .map(feedback -> new ProspectFeedbackResponse(
                        feedback.getId(),
                        feedback.getCreatedAt() != null ? DATE_FORMATTER.format(feedback.getCreatedAt()) : "",
                        feedback.getSentiment() != null ? feedback.getSentiment().name() : "PENDING",
                        buildFeedbackComment(feedback)
                ))
                .toList();
    }

    private ProspectFeedback getRequiredFeedback(String token) {
        return feedbackRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback request not found"));
    }

    private String buildFeedbackComment(ProspectFeedback feedback) {
        String context = switch (feedback.getContextStatus()) {
            case "BOUGHT" -> "Achat finalise";
            case "RENTED" -> "Location finalisee";
            case "LOST" -> "Dossier abandonne";
            default -> feedback.getContextStatus();
        };
        String property = feedback.getPropertyTitle() != null && !feedback.getPropertyTitle().isBlank()
                ? " - Bien: " + feedback.getPropertyTitle()
                : "";
        String comment = feedback.getComment() != null && !feedback.getComment().isBlank()
                ? " - " + feedback.getComment()
                : "";
        return context + property + comment;
    }

    private void sendFeedbackEmail(ProspectFeedback feedback) {
        String email = feedback.getProspect().getEmail();
        if (email == null || email.isBlank()) {
            return;
        }

        String link = clientBaseUrl + "/feedback/" + feedback.getToken();
        String subject = "Votre avis sur votre experience SAY Home";
        String contextLabel = switch (feedback.getContextStatus()) {
            case "BOUGHT" -> "votre achat";
            case "RENTED" -> "votre location";
            case "LOST" -> "votre dossier abandonne";
            default -> "votre experience";
        };
        String html = """
                <div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033">
                  <h2 style="color:#2c1a0e;">SAY Home</h2>
                  <p>Bonjour %s,</p>
                  <p>Nous aimerions recueillir votre avis concernant %s.</p>
                  <p>Vous pouvez repondre en quelques secondes via ce lien :</p>
                  <p><a href="%s" style="display:inline-block;background:#2c1a0e;color:#ffffff;padding:12px 18px;text-decoration:none;border-radius:8px;">Donner mon avis</a></p>
                  <p>Merci pour votre retour.</p>
                </div>
                """.formatted(
                feedback.getProspect().getFirstName() == null ? "client" : feedback.getProspect().getFirstName(),
                contextLabel,
                link
        );

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderEmail);
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException | MailException ignored) {
        }
    }
}
