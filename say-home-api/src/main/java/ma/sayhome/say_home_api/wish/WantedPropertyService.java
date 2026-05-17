package ma.sayhome.say_home_api.wish;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import ma.sayhome.say_home_api.appointment.Appointment;
import ma.sayhome.say_home_api.appointment.AppointmentRepository;
import ma.sayhome.say_home_api.property.Property;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.prospect.dto.ProspectWishResponse;
import ma.sayhome.say_home_api.shared.enums.PropertySecteur;
import ma.sayhome.say_home_api.shared.enums.PropertyType;
import ma.sayhome.say_home_api.shared.enums.WantedPropertySource;
import ma.sayhome.say_home_api.shared.exceptions.BadRequestException;
import ma.sayhome.say_home_api.shared.exceptions.ResourceNotFoundException;
import ma.sayhome.say_home_api.wish.dto.ProspectWishFormResponse;
import ma.sayhome.say_home_api.wish.dto.SubmitProspectWishRequest;
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
public class WantedPropertyService {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    private final WantedPropertyRepository wantedPropertyRepository;
    private final AppointmentRepository appointmentRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Value("${sayhome.client.url:http://localhost:3000}")
    private String clientBaseUrl;

    public WantedPropertyService(
            WantedPropertyRepository wantedPropertyRepository,
            AppointmentRepository appointmentRepository,
            JavaMailSender mailSender
    ) {
        this.wantedPropertyRepository = wantedPropertyRepository;
        this.appointmentRepository = appointmentRepository;
        this.mailSender = mailSender;
    }

    public WantedProperty createFromAgreement(Appointment appointment) {
        Property property = requireProperty(appointment);
        Prospect prospect = appointment.getProspect();

        WantedProperty wish = new WantedProperty();
        wish.setProspect(prospect);
        wish.setReferenceProperty(property);
        wish.setSource(WantedPropertySource.AGREEMENT);
        wish.setSubmitted(true);
        wish.setSubmittedAt(LocalDateTime.now());
        wish.setType(property.getType());
        wish.setSecteur(property.getSecteur());
        wish.setMinPrice(adjustFloat(property.getPrice(), 0.9f));
        wish.setMaxPrice(adjustFloat(property.getPrice(), 1.1f));
        wish.setMinSurface(adjustInt(property.getSurface(), 0.9f));
        wish.setMaxSurface(adjustInt(property.getSurface(), 1.1f));
        wish.setMinRooms(Math.max(1, property.getRooms() - 1));
        wish.setMaxRooms(property.getRooms() + 1);

        Integer bathrooms = property.getBathrooms() == null ? 0 : property.getBathrooms();
        wish.setMinBathrooms(Math.max(0, bathrooms - 1));
        wish.setMaxBathrooms(bathrooms + 1);

        wish.setClimatisation(Boolean.TRUE.equals(property.getClimatisation()) ? Boolean.TRUE : null);
        wish.setPiscine(shouldTrackPiscineOrJardin(property) && Boolean.TRUE.equals(property.getPiscine()) ? Boolean.TRUE : null);
        wish.setJardin(shouldTrackPiscineOrJardin(property) && Boolean.TRUE.equals(property.getJardin()) ? Boolean.TRUE : null);
        wish.setGarage(property.getType() != PropertyType.STUDIO && Boolean.TRUE.equals(property.getGarage()) ? Boolean.TRUE : null);
        wish.setSecurite(Boolean.TRUE.equals(property.getSecurite()) ? Boolean.TRUE : null);
        wish.setSystemeDomotiqueComplet(Boolean.TRUE.equals(property.getSystemeDomotiqueComplet()) ? Boolean.TRUE : null);

        return wantedPropertyRepository.save(wish);
    }

    public void requestFromNoAgreement(Appointment appointment) {
        Property property = requireProperty(appointment);
        Prospect prospect = appointment.getProspect();
        String token = UUID.randomUUID().toString();
        appointment.setWishRequestToken(token);
        appointment.setWishFormSentAt(LocalDateTime.now());
        appointmentRepository.save(appointment);
        sendWishFormEmail(prospect, property, token);
    }

    public ProspectWishFormResponse getPublicForm(String token) {
        WantedProperty submittedWish = wantedPropertyRepository.findByToken(token).orElse(null);
        if (submittedWish != null) {
            return new ProspectWishFormResponse(
                    submittedWish.getToken(),
                    effectiveProspectName(submittedWish.getProspect()),
                    submittedWish.getReferenceProperty() != null ? submittedWish.getReferenceProperty().getTitle() : null,
                    true
            );
        }

        Appointment appointment = appointmentRepository.findByWishRequestToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Wish request not found"));

        return new ProspectWishFormResponse(
                token,
                effectiveProspectName(appointment.getProspect()),
                appointment.getProperty() != null ? appointment.getProperty().getTitle() : null,
                false
        );
    }

    public ProspectWishFormResponse submit(String token, SubmitProspectWishRequest request) {
        WantedProperty existingWish = wantedPropertyRepository.findByToken(token).orElse(null);
        if (existingWish != null && existingWish.isSubmitted()) {
            throw new BadRequestException("Wish already submitted");
        }

        Appointment appointment = appointmentRepository.findByWishRequestToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Wish request not found"));

        WantedProperty wish = existingWish != null ? existingWish : new WantedProperty();
        wish.setProspect(appointment.getProspect());
        wish.setReferenceProperty(appointment.getProperty());
        wish.setSource(WantedPropertySource.FORM);
        wish.setToken(token);
        wish.setType(parseType(request.type));
        wish.setSecteur(parseSecteur(request.secteur));
        wish.setMinPrice(request.minPrice);
        wish.setMaxPrice(request.maxPrice);
        wish.setMinSurface(request.minSurface);
        wish.setMaxSurface(request.maxSurface);
        wish.setMinRooms(request.minRooms);
        wish.setMaxRooms(request.maxRooms);
        wish.setMinBathrooms(request.minBathrooms);
        wish.setMaxBathrooms(request.maxBathrooms);
        wish.setClimatisation(boolOrNull(request.climatisation));
        wish.setPiscine(boolOrNull(request.piscine));
        wish.setJardin(boolOrNull(request.jardin));
        wish.setGarage(boolOrNull(request.garage));
        wish.setSecurite(boolOrNull(request.securite));
        wish.setSystemeDomotiqueComplet(boolOrNull(request.systemeDomotiqueComplet));
        wish.setSubmitted(true);
        wish.setSubmittedAt(LocalDateTime.now());
        normalizeWishAmenities(wish);
        wantedPropertyRepository.save(wish);

        return new ProspectWishFormResponse(
                wish.getToken(),
                effectiveProspectName(wish.getProspect()),
                wish.getReferenceProperty() != null ? wish.getReferenceProperty().getTitle() : null,
                true
        );
    }

    public List<ProspectWishResponse> findByProspectId(Integer prospectId) {
        return wantedPropertyRepository.findByProspectIdOrderByCreatedAtDesc(prospectId).stream()
                .map(wish -> new ProspectWishResponse(
                        wish.getId(),
                        wish.getCreatedAt() != null ? DATE_FORMATTER.format(wish.getCreatedAt()) : "",
                        wish.getSource().name(),
                        wish.isSubmitted(),
                        buildWishTitle(wish),
                        buildWishSummary(wish)
                ))
                .toList();
    }

    private Property requireProperty(Appointment appointment) {
        if (appointment.getProperty() == null) {
            throw new BadRequestException("A property is required for this visit outcome");
        }
        return appointment.getProperty();
    }

    private void sendWishFormEmail(Prospect prospect, Property property, String token) {
        String email = prospect.getEmail();
        if (email == null || email.isBlank()) {
            return;
        }

        String link = clientBaseUrl + "/wishes/" + token;
        String propertyTitle = property != null ? property.getTitle() : "ce bien";
        String html = """
                <div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033">
                  <h2 style="color:#2c1a0e;">SAY Home</h2>
                  <p>Bonjour %s,</p>
                  <p>Merci pour votre visite. Afin de mieux cibler les biens qui vous correspondent, nous vous invitons a renseigner vos souhaits apres la visite de %s.</p>
                  <p><a href="%s" style="display:inline-block;background:#2c1a0e;color:#ffffff;padding:12px 18px;text-decoration:none;border-radius:8px;">Renseigner mes souhaits</a></p>
                  <p>Notre equipe utilisera ces criteres pour vous recommander de nouveaux biens.</p>
                </div>
                """.formatted(
                prospect.getFirstName() == null ? "client" : prospect.getFirstName(),
                propertyTitle,
                link
        );

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderEmail);
            helper.setTo(email);
            helper.setSubject("Partagez vos souhaits immobiliers - SAY Home");
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException | MailException ignored) {
        }
    }

    private String buildWishTitle(WantedProperty wish) {
        if (wish.getSource() == WantedPropertySource.AGREEMENT) {
            String propertyTitle = wish.getReferenceProperty() != null ? wish.getReferenceProperty().getTitle() : "un bien visite";
            return "Accord apres visite - " + propertyTitle;
        }
        return wish.isSubmitted() ? "Souhait renseigne par formulaire" : "Formulaire de souhait envoye";
    }

    private String buildWishSummary(WantedProperty wish) {
        StringBuilder summary = new StringBuilder();
        append(summary, wish.getType() != null ? formatType(wish.getType()) : null);
        append(summary, wish.getSecteur() != null ? formatSecteur(wish.getSecteur()) : null);
        append(summary, formatRange("Prix", wish.getMinPrice(), wish.getMaxPrice(), "MAD"));
        append(summary, formatRange("Surface", wish.getMinSurface(), wish.getMaxSurface(), "m2"));
        append(summary, formatRange("Chambres", wish.getMinRooms(), wish.getMaxRooms(), null));
        append(summary, formatRange("Salles de bain", wish.getMinBathrooms(), wish.getMaxBathrooms(), null));
        append(summary, flag("Climatisation", wish.getClimatisation()));
        append(summary, flag("Piscine", wish.getPiscine()));
        append(summary, flag("Jardin", wish.getJardin()));
        append(summary, flag("Garage", wish.getGarage()));
        append(summary, flag("Securite", wish.getSecurite()));
        append(summary, flag("Domotique", wish.getSystemeDomotiqueComplet()));
        return summary.isEmpty() ? "Aucun critere detaille pour le moment." : summary.toString();
    }

    private void append(StringBuilder summary, String value) {
        if (value == null || value.isBlank()) {
            return;
        }
        if (!summary.isEmpty()) {
            summary.append(" | ");
        }
        summary.append(value);
    }

    private String flag(String label, Boolean value) {
        return Boolean.TRUE.equals(value) ? label : null;
    }

    private String formatRange(String label, Number min, Number max, String unit) {
        if (min == null && max == null) {
            return null;
        }
        String suffix = unit == null ? "" : " " + unit;
        if (min != null && max != null) {
            return label + ": " + min + " - " + max + suffix;
        }
        if (min != null) {
            return label + ": >= " + min + suffix;
        }
        return label + ": <= " + max + suffix;
    }

    private String effectiveProspectName(Prospect prospect) {
        String firstName = prospect.getFirstName() == null ? "" : prospect.getFirstName();
        String lastName = prospect.getLastName() == null ? "" : prospect.getLastName();
        return (firstName + " " + lastName).trim();
    }

    private PropertyType parseType(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return PropertyType.fromStorageValue(value);
    }

    private PropertySecteur parseSecteur(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return PropertySecteur.fromStorageValue(value);
    }

    private Boolean boolOrNull(Boolean value) {
        return Boolean.TRUE.equals(value) ? Boolean.TRUE : null;
    }

    private void normalizeWishAmenities(WantedProperty wish) {
        if (wish.getType() != PropertyType.VILLA && wish.getType() != PropertyType.RIAD) {
            wish.setPiscine(null);
            wish.setJardin(null);
        }
        if (wish.getType() == PropertyType.STUDIO) {
            wish.setGarage(null);
        }
    }

    private boolean shouldTrackPiscineOrJardin(Property property) {
        return property.getType() == PropertyType.VILLA || property.getType() == PropertyType.RIAD;
    }

    private Float adjustFloat(Float base, float factor) {
        if (base == null) {
            return null;
        }
        return (float) Math.round(base * factor);
    }

    private Integer adjustInt(Integer base, float factor) {
        if (base == null) {
            return null;
        }
        return Math.max(1, Math.round(base * factor));
    }

    private String formatType(PropertyType type) {
        return switch (type) {
            case RIAD -> "Riad";
            case VILLA -> "Villa";
            case APPARTEMENT -> "Appartement";
            case STUDIO -> "Studio";
        };
    }

    private String formatSecteur(PropertySecteur secteur) {
        return switch (secteur) {
            case GUELIZ -> "Gueliz";
            case PALMERAIE -> "Palmeraie";
            case TARGA -> "Targa";
            case MEDINA -> "Medina";
            case ROUTE_D_OURIKA -> "Route d'Ourika";
            case AGDAL -> "Agdal";
            case HIVERNAGE -> "Hivernage";
            case MABROUKA -> "Mabrouka";
        };
    }
}
