package ma.sayhome.say_home_api.prospectProperty.document;

import ma.sayhome.say_home_api.property.Property;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.prospectProperty.ProspectPropertyRecord;
import ma.sayhome.say_home_api.prospectProperty.dto.ProspectPropertyExpectedDocumentResponse;
import ma.sayhome.say_home_api.shared.enums.ProspectPropertyDocumentType;
import ma.sayhome.say_home_api.shared.enums.ProspectPropertyStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;

@Service
public class ProspectPropertyDocumentTemplateService {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public List<ProspectPropertyExpectedDocumentResponse> buildExpectedDocuments(
            ProspectPropertyRecord record,
            List<ProspectPropertyDocument> uploadedDocuments
    ) {
        Set<ProspectPropertyDocumentType> uploadedTypes = uploadedDocuments.stream()
                .map(ProspectPropertyDocument::getType)
                .collect(java.util.stream.Collectors.toSet());

        if (record.getStatus() == ProspectPropertyStatus.BOUGHT) {
            return List.of(
                    build(record, ProspectPropertyDocumentType.SALE_DEED, "Acte de vente",
                            "Document officiel signe qui confirme le transfert de propriete.",
                            saleDeedTemplate(record), uploadedTypes),
                    build(record, ProspectPropertyDocumentType.LAND_TITLE, "Titre foncier",
                            "Document de conservation fonciere rattache au bien achete.",
                            landTitleTemplate(record), uploadedTypes),
                    build(record, ProspectPropertyDocumentType.MORTGAGE_CONTRACT, "Contrat de credit immobilier",
                            "Contrat bancaire de financement du bien si un pret est utilise.",
                            mortgageContractTemplate(record), uploadedTypes),
                    build(record, ProspectPropertyDocumentType.PAYMENT_RECEIPT, "Recu de paiement",
                            "Justificatif du versement effectue dans le cadre de l'achat.",
                            paymentReceiptTemplate(record), uploadedTypes)
            );
        }

        if (record.getStatus() == ProspectPropertyStatus.RENTED) {
            return List.of(
                    build(record, ProspectPropertyDocumentType.LEASE_CONTRACT, "Contrat de bail",
                            "Contrat principal qui encadre la location du bien.",
                            leaseContractTemplate(record), uploadedTypes),
                    build(record, ProspectPropertyDocumentType.RENT_RECEIPT, "Quittance de loyer",
                            "Recu du paiement mensuel du loyer.",
                            rentReceiptTemplate(record), uploadedTypes),
                    build(record, ProspectPropertyDocumentType.PROPERTY_INSPECTION_REPORT, "Etat des lieux",
                            "Constat du logement au debut ou a la fin de la location.",
                            propertyInspectionTemplate(record), uploadedTypes),
                    build(record, ProspectPropertyDocumentType.SECURITY_DEPOSIT_RECEIPT, "Recu de caution",
                            "Justificatif du depot de garantie verse a l'entree.",
                            securityDepositReceiptTemplate(record), uploadedTypes)
            );
        }

        return List.of();
    }

    private ProspectPropertyExpectedDocumentResponse build(
            ProspectPropertyRecord record,
            ProspectPropertyDocumentType type,
            String title,
            String description,
            String sampleContent,
            Set<ProspectPropertyDocumentType> uploadedTypes
    ) {
        return new ProspectPropertyExpectedDocumentResponse(
                type.name(),
                title,
                description,
                sampleContent,
                uploadedTypes.contains(type)
        );
    }

    private String saleDeedTemplate(ProspectPropertyRecord record) {
        Prospect prospect = record.getProspect();
        Property property = record.getProperty();
        String ownerName = resolveOwnerName(property);
        String price = formatMoney(record.getFinalPrice() != null ? record.getFinalPrice() : property.getPrice());
        return """
                ACTE DE VENTE IMMOBILIERE

                Entre les soussignes :

                Vendeur :
                Nom : %s
                CIN : A renseigner
                Adresse : %s, Maroc

                Acheteur :
                Nom : %s %s
                CIN : A renseigner
                Adresse : %s, Maroc

                Objet :
                Vente du bien situe a :
                %s, %s.

                Superficie :
                %s m²

                Prix de vente :
                %s MAD

                Mode de paiement :
                A renseigner.

                Le vendeur declare ceder definitivement le bien a l'acheteur.

                Date : %s

                Signature vendeur
                Signature acheteur
                Signature notaire
                """.formatted(
                ownerName,
                property.getSecteur(),
                prospect.getFirstName(),
                prospect.getLastName(),
                prospect.getCity(),
                property.getTitle(),
                property.getSecteur(),
                property.getSurface(),
                price,
                formatDate(LocalDate.now())
        );
    }

    private String landTitleTemplate(ProspectPropertyRecord record) {
        Prospect prospect = record.getProspect();
        Property property = record.getProperty();
        return """
                TITRE FONCIER

                Numero TF : A renseigner

                Proprietaire :
                %s %s

                Type de bien :
                %s

                Adresse :
                %s, %s

                Superficie :
                %s m²

                Statut :
                Aucune hypothèque enregistree.

                Conservation Fonciere du Maroc

                Date d'enregistrement :
                %s
                """.formatted(
                prospect.getFirstName(),
                prospect.getLastName(),
                safeValue(property.getType()),
                property.getTitle(),
                property.getSecteur(),
                property.getSurface(),
                formatDate(LocalDate.now())
        );
    }

    private String mortgageContractTemplate(ProspectPropertyRecord record) {
        Prospect prospect = record.getProspect();
        Property property = record.getProperty();
        float finalPrice = record.getFinalPrice() != null ? record.getFinalPrice() : property.getPrice();
        float loanAmount = Math.round(finalPrice * 0.75f);
        return """
                CONTRAT DE CREDIT IMMOBILIER

                Banque :
                A renseigner

                Client :
                %s %s

                Montant du pret :
                %s MAD

                Duree :
                20 ans

                Mensualite :
                A renseigner

                Taux d'interet :
                A renseigner

                Objet :
                Financement du bien %s a %s.

                Date :
                %s

                Signature banque
                Signature client
                """.formatted(
                prospect.getFirstName(),
                prospect.getLastName(),
                formatMoney(loanAmount),
                property.getTitle(),
                property.getSecteur(),
                formatDate(LocalDate.now())
        );
    }

    private String paymentReceiptTemplate(ProspectPropertyRecord record) {
        Prospect prospect = record.getProspect();
        Property property = record.getProperty();
        String ownerName = resolveOwnerName(property);
        float finalPrice = record.getFinalPrice() != null ? record.getFinalPrice() : property.getPrice();
        float deposit = Math.round(finalPrice * 0.2f);
        return """
                RECU DE PAIEMENT

                Je soussigne %s,
                reconnais avoir recu de :

                %s %s

                La somme de :
                %s MAD

                Objet :
                Acompte pour achat immobilier.

                Date :
                %s

                Signature
                """.formatted(
                ownerName,
                prospect.getFirstName(),
                prospect.getLastName(),
                formatMoney(deposit),
                formatDate(LocalDate.now())
        );
    }

    private String leaseContractTemplate(ProspectPropertyRecord record) {
        Prospect prospect = record.getProspect();
        Property property = record.getProperty();
        String ownerName = resolveOwnerName(property);
        String monthlyRent = formatMoney(record.getFinalPrice() != null ? record.getFinalPrice() : property.getPrice());
        float securityDeposit = Math.round((record.getFinalPrice() != null ? record.getFinalPrice() : property.getPrice()) * 2f);
        return """
                CONTRAT DE BAIL

                Proprietaire :
                %s

                Locataire :
                %s %s

                Bien loue :
                %s, %s.

                Duree :
                12 mois

                Loyer mensuel :
                %s MAD

                Caution :
                %s MAD

                Le locataire s'engage a respecter les conditions du logement.

                Date :
                %s

                Signature proprietaire
                Signature locataire
                """.formatted(
                ownerName,
                prospect.getFirstName(),
                prospect.getLastName(),
                property.getTitle(),
                property.getSecteur(),
                monthlyRent,
                formatMoney(securityDeposit),
                formatDate(LocalDate.now())
        );
    }

    private String rentReceiptTemplate(ProspectPropertyRecord record) {
        Prospect prospect = record.getProspect();
        Property property = record.getProperty();
        String ownerName = resolveOwnerName(property);
        String monthlyRent = formatMoney(record.getFinalPrice() != null ? record.getFinalPrice() : property.getPrice());
        return """
                QUITTANCE DE LOYER

                Je soussigne %s,
                certifie avoir recu de :

                %s %s

                Le montant de :
                %s MAD

                Correspondant au loyer du mois :
                %s

                Adresse du logement :
                %s, %s

                Date :
                %s

                Signature
                """.formatted(
                ownerName,
                prospect.getFirstName(),
                prospect.getLastName(),
                monthlyRent,
                LocalDate.now().getMonth().name(),
                property.getTitle(),
                property.getSecteur(),
                formatDate(LocalDate.now())
        );
    }

    private String propertyInspectionTemplate(ProspectPropertyRecord record) {
        Property property = record.getProperty();
        return """
                ETAT DES LIEUX

                Adresse :
                %s, %s

                Salon :
                Bon etat

                Cuisine :
                Equipements fonctionnels

                Salle de bain :
                Bon etat

                Chambres :
                Aucune degradation constatee

                Compteurs :
                Eau : A renseigner
                Electricite : A renseigner

                Date :
                %s

                Signature proprietaire
                Signature locataire
                """.formatted(
                property.getTitle(),
                property.getSecteur(),
                formatDate(LocalDate.now())
        );
    }

    private String securityDepositReceiptTemplate(ProspectPropertyRecord record) {
        Prospect prospect = record.getProspect();
        Property property = record.getProperty();
        String ownerName = resolveOwnerName(property);
        float monthlyRent = record.getFinalPrice() != null ? record.getFinalPrice() : property.getPrice();
        float securityDeposit = Math.round(monthlyRent * 2f);
        return """
                RECU DE CAUTION

                Je soussigne %s,
                reconnais avoir recu :

                %s MAD

                de la part de :
                %s %s

                comme depot de garantie
                pour la location du logement situe a %s.

                Date :
                %s

                Signature
                """.formatted(
                ownerName,
                formatMoney(securityDeposit),
                prospect.getFirstName(),
                prospect.getLastName(),
                property.getSecteur(),
                formatDate(LocalDate.now())
        );
    }

    private String resolveOwnerName(Property property) {
        if (property.getAgent() == null) {
            return "Proprietaire a renseigner";
        }

        String firstName = property.getAgent().getFirstName() == null ? "" : property.getAgent().getFirstName().trim();
        String lastName = property.getAgent().getLastName() == null ? "" : property.getAgent().getLastName().trim();
        String fullName = (firstName + " " + lastName).trim();
        return fullName.isBlank() ? "Proprietaire a renseigner" : fullName;
    }

    private String safeValue(String value) {
        return value == null || value.isBlank() ? "A renseigner" : value;
    }

    private String formatMoney(float amount) {
        return String.format("%.0f", amount);
    }

    private String formatDate(LocalDate date) {
        return DATE_FORMATTER.format(date);
    }
}
