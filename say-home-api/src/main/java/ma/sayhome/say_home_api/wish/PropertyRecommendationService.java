package ma.sayhome.say_home_api.wish;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import ma.sayhome.say_home_api.property.Property;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.shared.enums.PropertyRecommendationStatus;
import ma.sayhome.say_home_api.shared.enums.PropertyType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class PropertyRecommendationService {
    private final WantedPropertyRepository wantedPropertyRepository;
    private final PropertyRecommendationRepository propertyRecommendationRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Value("${sayhome.client.url:http://localhost:3000}")
    private String clientBaseUrl;

    public PropertyRecommendationService(
            WantedPropertyRepository wantedPropertyRepository,
            PropertyRecommendationRepository propertyRecommendationRepository,
            JavaMailSender mailSender
    ) {
        this.wantedPropertyRepository = wantedPropertyRepository;
        this.propertyRecommendationRepository = propertyRecommendationRepository;
        this.mailSender = mailSender;
    }

    public void recommendFor(Property property) {
        for (WantedProperty wish : wantedPropertyRepository.findBySubmittedTrueOrderByCreatedAtDesc()) {
            if (propertyRecommendationRepository.existsByProspectIdAndPropertyId(
                    wish.getProspect().getId(),
                    property.getId()
            )) {
                continue;
            }

            int matchScore = calculateMatchScore(property, wish);
            if (matchScore < 0) {
                continue;
            }

            PropertyRecommendation recommendation = new PropertyRecommendation();
            recommendation.setProspect(wish.getProspect());
            recommendation.setProperty(property);
            recommendation.setWantedProperty(wish);
            recommendation.setMatchScore(matchScore);
            recommendation.setStatus(PropertyRecommendationStatus.SENT);
            propertyRecommendationRepository.save(recommendation);
            sendRecommendationEmail(wish.getProspect(), property);
        }
    }

    private int calculateMatchScore(Property property, WantedProperty wish) {
        int score = 0;

        if (wish.getType() != null) {
            if (wish.getType() != property.getType()) {
                return -1;
            }
            score += 20;
        }

        if (wish.getSecteur() != null) {
            if (wish.getSecteur() != property.getSecteur()) {
                return -1;
            }
            score += 15;
        }

        if (!withinRange(property.getPrice(), wish.getMinPrice(), wish.getMaxPrice())) {
            return -1;
        }
        if (wish.getMinPrice() != null || wish.getMaxPrice() != null) {
            score += 15;
        }

        if (!withinRange(property.getSurface(), wish.getMinSurface(), wish.getMaxSurface())) {
            return -1;
        }
        if (wish.getMinSurface() != null || wish.getMaxSurface() != null) {
            score += 10;
        }

        if (!withinRange(property.getRooms(), wish.getMinRooms(), wish.getMaxRooms())) {
            return -1;
        }
        if (wish.getMinRooms() != null || wish.getMaxRooms() != null) {
            score += 10;
        }

        Integer bathrooms = property.getBathrooms() == null ? 0 : property.getBathrooms();
        if (!withinRange(bathrooms, wish.getMinBathrooms(), wish.getMaxBathrooms())) {
            return -1;
        }
        if (wish.getMinBathrooms() != null || wish.getMaxBathrooms() != null) {
            score += 10;
        }

        if (!matchesAmenity(wish.getClimatisation(), property.getClimatisation())) return -1;
        if (!matchesAmenity(wish.getPiscine(), property.getPiscine())) return -1;
        if (!matchesAmenity(wish.getJardin(), property.getJardin())) return -1;
        if (!matchesAmenity(wish.getGarage(), property.getType() == PropertyType.STUDIO ? false : property.getGarage())) return -1;
        if (!matchesAmenity(wish.getSecurite(), property.getSecurite())) return -1;
        if (!matchesAmenity(wish.getSystemeDomotiqueComplet(), property.getSystemeDomotiqueComplet())) return -1;

        score += amenityScore(wish.getClimatisation());
        score += amenityScore(wish.getPiscine());
        score += amenityScore(wish.getJardin());
        score += amenityScore(wish.getGarage());
        score += amenityScore(wish.getSecurite());
        score += amenityScore(wish.getSystemeDomotiqueComplet());

        return score;
    }

    private boolean withinRange(Number value, Number min, Number max) {
        if (value == null) {
            return min == null && max == null;
        }
        double candidate = value.doubleValue();
        if (min != null && candidate < min.doubleValue()) {
            return false;
        }
        if (max != null && candidate > max.doubleValue()) {
            return false;
        }
        return true;
    }

    private boolean matchesAmenity(Boolean desired, Boolean actual) {
        return !Boolean.TRUE.equals(desired) || Boolean.TRUE.equals(actual);
    }

    private int amenityScore(Boolean desired) {
        return Boolean.TRUE.equals(desired) ? 5 : 0;
    }

    private void sendRecommendationEmail(Prospect prospect, Property property) {
        String email = prospect.getEmail();
        if (email == null || email.isBlank()) {
            return;
        }

        String propertyLink = clientBaseUrl + "/properties/" + property.getId();
        String html = """
                <div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033">
                  <h2 style="color:#2c1a0e;">SAY Home</h2>
                  <p>Bonjour %s,</p>
                  <p>Nous avons trouve une propriete qui pourrait vous plaire.</p>
                  <ul>
                    <li><strong>Bien:</strong> %s</li>
                    <li><strong>Type:</strong> %s</li>
                    <li><strong>Secteur:</strong> %s</li>
                    <li><strong>Prix:</strong> %.0f MAD</li>
                    <li><strong>Chambres:</strong> %d</li>
                    <li><strong>Surface:</strong> %d m2</li>
                  </ul>
                  <p><a href="%s" style="display:inline-block;background:#2c1a0e;color:#ffffff;padding:12px 18px;text-decoration:none;border-radius:8px;">Voir la propriete</a></p>
                </div>
                """.formatted(
                prospect.getFirstName() == null ? "client" : prospect.getFirstName(),
                property.getTitle(),
                property.getType() == null ? "" : property.getType().name(),
                property.getSecteur() == null ? "" : property.getSecteur().name(),
                property.getPrice() == null ? 0f : property.getPrice(),
                property.getRooms() == null ? 0 : property.getRooms(),
                property.getSurface() == null ? 0 : property.getSurface(),
                propertyLink
        );

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderEmail);
            helper.setTo(email);
            helper.setSubject("Une propriete pourrait vous correspondre - SAY Home");
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException | MailException ignored) {
        }
    }
}
