package ma.sayhome.say_home_api.prospectProperty.document;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import ma.sayhome.say_home_api.property.Property;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.prospectProperty.ProspectPropertyRecord;
import ma.sayhome.say_home_api.shared.enums.ProspectPropertyDocumentType;
import ma.sayhome.say_home_api.shared.enums.ProspectPropertyStatus;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProspectPropertyClosingDocumentService {
    private static final String SAY_HOME_EMAIL = "sayhome.app@gmail.com";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final ProspectPropertyDocumentService documentService;
    private final ProspectPropertyDocumentRepository documentRepository;
    private final JavaMailSender mailSender;

    public ProspectPropertyClosingDocumentService(
            ProspectPropertyDocumentService documentService,
            ProspectPropertyDocumentRepository documentRepository,
            JavaMailSender mailSender
    ) {
        this.documentService = documentService;
        this.documentRepository = documentRepository;
        this.mailSender = mailSender;
    }

    public ProspectPropertyDocument ensureGenerated(
            ProspectPropertyRecord record,
            ProspectPropertyDocument beforeDocument
    ) {
        ProspectPropertyDocumentType finalType = resolveFinalType(record.getStatus());
        return documentRepository.findFirstByRecordIdAndTypeOrderByCreatedAtDesc(record.getId(), finalType)
                .orElseGet(() -> generateAndSend(record, beforeDocument, finalType));
    }

    private ProspectPropertyDocument generateAndSend(
            ProspectPropertyRecord record,
            ProspectPropertyDocument beforeDocument,
            ProspectPropertyDocumentType type
    ) {
        try {
            String label = getDocumentLabel(type);
            String fileName = buildFileName(record, type);
            byte[] generatedPdf = buildPdf(record, type, label);
            ProspectPropertyDocument document = documentService.uploadGeneratedPdf(
                    generatedPdf,
                    fileName,
                    record,
                    type
            );
            sendDocumentEmail(record, beforeDocument, document, generatedPdf, label);
            return document;
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to generate closing document", exception);
        }
    }

    private void sendDocumentEmail(
            ProspectPropertyRecord record,
            ProspectPropertyDocument beforeDocument,
            ProspectPropertyDocument generatedDocument,
            byte[] generatedPdf,
            String label
    ) {
        Prospect prospect = record.getProspect();
        MimeMessage message = mailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(SAY_HOME_EMAIL);
            helper.setTo(prospect.getEmail());
            helper.setSubject(label + " - Say Home");
            helper.setText(buildEmailHtml(prospect, beforeDocument, generatedDocument, label), true);
            helper.addAttachment(
                    beforeDocument.getName(),
                    new ByteArrayResource(documentService.downloadDocument(beforeDocument.getId())),
                    "application/pdf"
            );
            helper.addAttachment(
                    generatedDocument.getName(),
                    new ByteArrayResource(generatedPdf),
                    "application/pdf"
            );
            mailSender.send(message);
        } catch (MessagingException | MailException | IOException exception) {
            System.err.println("Closing document email could not be sent: " + exception.getMessage());
        }
    }

    private ProspectPropertyDocumentType resolveFinalType(ProspectPropertyStatus status) {
        if (status == ProspectPropertyStatus.BOUGHT) {
            return ProspectPropertyDocumentType.SALE_DEED;
        }
        if (status == ProspectPropertyStatus.RENTED) {
            return ProspectPropertyDocumentType.LEASE_CONTRACT;
        }
        throw new IllegalArgumentException("No closing document for status " + status);
    }

    private String buildFileName(ProspectPropertyRecord record, ProspectPropertyDocumentType type) {
        String slug = type == ProspectPropertyDocumentType.SALE_DEED
                ? "acte-de-vente"
                : "contrat-de-bail";
        return slug + "-prospect-" + record.getProspect().getId() + "-bien-" + record.getProperty().getId() + ".pdf";
    }

    private String getDocumentLabel(ProspectPropertyDocumentType type) {
        return type == ProspectPropertyDocumentType.SALE_DEED
                ? "Acte de vente"
                : "Contrat de bail";
    }

    private byte[] buildPdf(
            ProspectPropertyRecord record,
            ProspectPropertyDocumentType type,
            String title
    ) {
        List<String> lines = new ArrayList<>();
        lines.add("SAY HOME");
        lines.add("");
        lines.add(title.toUpperCase());
        lines.add("");

        if (type == ProspectPropertyDocumentType.LEASE_CONTRACT) {
            addLeaseContractLines(lines, record);
        } else {
            addSaleDeedLines(lines, record);
        }

        return renderSimplePdf(lines);
    }

    private void addLeaseContractLines(List<String> lines, ProspectPropertyRecord record) {
        Prospect prospect = record.getProspect();
        Property property = record.getProperty();
        String ownerName = resolveOwnerName(property);
        String tenantName = buildProspectName(prospect);
        String monthlyRent = formatMoney(record.getFinalPrice() != null ? record.getFinalPrice() : property.getPrice()) + " MAD";
        String caution = formatMoney((record.getFinalPrice() != null ? record.getFinalPrice() : property.getPrice()) * 2) + " MAD";

        lines.add("Proprietaire : " + ownerName);
        lines.add("Locataire : " + tenantName);
        lines.add("Adresse du bien : " + safeValue(property.getTitle()) + ", " + safeValue(property.getSecteur() != null ? property.getSecteur().name() : null));
        lines.add("Duree : 12 mois");
        lines.add("Loyer mensuel : " + monthlyRent);
        lines.add("Caution : " + caution);
        lines.add("Date de debut : " + formatDate(LocalDate.now()));
        lines.add("");
        lines.add("Le locataire accepte les conditions de location du logement.");
        lines.add("");
        lines.add("Signature proprietaire : " + ownerName);
        lines.add("Signature locataire : " + tenantName);
    }

    private void addSaleDeedLines(List<String> lines, ProspectPropertyRecord record) {
        Prospect prospect = record.getProspect();
        Property property = record.getProperty();
        String ownerName = resolveOwnerName(property);
        String buyerName = buildProspectName(prospect);

        lines.add("Vendeur : " + ownerName);
        lines.add("Acheteur : " + buyerName);
        lines.add("Bien : " + safeValue(property.getTitle()) + ", " + safeValue(property.getSecteur() != null ? property.getSecteur().name() : null));
        lines.add("Superficie : " + formatMoney(property.getSurface()) + " m2");
        lines.add("Prix : " + formatMoney(record.getFinalPrice() != null ? record.getFinalPrice() : property.getPrice()) + " MAD");
        lines.add("Date de signature : " + formatDate(LocalDate.now()));
        lines.add("");
        lines.add("Le vendeur confirme la vente definitive du bien a l'acheteur.");
        lines.add("");
        lines.add("Signature vendeur : " + ownerName);
        lines.add("Signature acheteur : " + buyerName);
        lines.add("Signature notaire : Say Home");
    }

    private byte[] renderSimplePdf(List<String> lines) {
        try {
            StringBuilder content = new StringBuilder();
            content.append("BT\n");
            content.append("/F1 12 Tf\n");
            content.append("50 790 Td\n");

            boolean first = true;
            for (String line : lines) {
                if (!first) {
                    content.append("0 -18 Td\n");
                }
                content.append("(").append(escapePdf(line)).append(") Tj\n");
                first = false;
            }
            content.append("ET");

            String stream = content.toString();
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            List<Integer> offsets = new ArrayList<>();

            write(output, "%PDF-1.4\n");
            offsets.add(output.size());
            write(output, "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n");
            offsets.add(output.size());
            write(output, "2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj\n");
            offsets.add(output.size());
            write(output, "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >> endobj\n");
            offsets.add(output.size());
            write(output, "4 0 obj << /Length " + stream.getBytes(StandardCharsets.US_ASCII).length + " >> stream\n");
            write(output, stream);
            write(output, "\nendstream endobj\n");
            offsets.add(output.size());
            write(output, "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n");

            int xrefOffset = output.size();
            write(output, "xref\n0 6\n");
            write(output, "0000000000 65535 f \n");
            for (Integer offset : offsets) {
                write(output, String.format("%010d 00000 n \n", offset));
            }
            write(output, "trailer << /Size 6 /Root 1 0 R >>\n");
            write(output, "startxref\n" + xrefOffset + "\n%%EOF");
            return output.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to render PDF", exception);
        }
    }

    private void write(ByteArrayOutputStream output, String value) throws IOException {
        output.write(value.getBytes(StandardCharsets.US_ASCII));
    }

    private String escapePdf(String line) {
        String normalized = line
                .replace("’", "'")
                .replace("é", "e")
                .replace("è", "e")
                .replace("ê", "e")
                .replace("à", "a")
                .replace("ù", "u")
                .replace("ô", "o")
                .replace("î", "i")
                .replace("ç", "c");

        return normalized
                .replace("\\", "\\\\")
                .replace("(", "\\(")
                .replace(")", "\\)");
    }

    private String buildEmailHtml(
            Prospect prospect,
            ProspectPropertyDocument beforeDocument,
            ProspectPropertyDocument generatedDocument,
            String label
    ) {
        String prospectName = buildProspectName(prospect);
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
                                <h1 style="margin:0 0 18px 0;font-size:28px;line-height:1.25;color:#222222;font-weight:700;">Vos documents sont prets</h1>
                                <p style="margin:0 0 14px 0;font-size:16px;line-height:1.7;color:#333333;">Bonjour %s,</p>
                                <p style="margin:0 0 20px 0;font-size:15px;line-height:1.7;color:#555555;">Vous trouverez ci-joint vos deux documents PDF ainsi que leurs liens directs.</p>
                                <p style="margin:0 0 10px 0;font-size:14px;color:#222222;"><strong>Document avant :</strong> <a href="%s">%s</a></p>
                                <p style="margin:0 0 10px 0;font-size:14px;color:#222222;"><strong>Document apres :</strong> <a href="%s">%s</a></p>
                                <p style="margin:18px 0 0 0;font-size:13px;line-height:1.6;color:#777777;">Document apres genere : %s</p>
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
                """.formatted(
                prospectName,
                beforeDocument.getUrl(),
                beforeDocument.getName(),
                generatedDocument.getUrl(),
                generatedDocument.getName(),
                label
        );
    }

    private String buildProspectName(Prospect prospect) {
        return (safeValue(prospect.getFirstName()) + " " + safeValue(prospect.getLastName())).trim();
    }

    private String resolveOwnerName(Property property) {
        if (property.getAgent() == null) {
            return "Proprietaire a renseigner";
        }

        String firstName = safeValue(property.getAgent().getFirstName());
        String lastName = safeValue(property.getAgent().getLastName());
        String fullName = (firstName + " " + lastName).trim();
        return fullName.isBlank() ? "Proprietaire a renseigner" : fullName;
    }

    private String safeValue(String value) {
        return value == null || value.isBlank() ? "A renseigner" : value.trim();
    }

    private String formatMoney(float amount) {
        return String.format("%.0f", amount);
    }

    private String formatDate(LocalDate date) {
        return DATE_FORMATTER.format(date);
    }
}
