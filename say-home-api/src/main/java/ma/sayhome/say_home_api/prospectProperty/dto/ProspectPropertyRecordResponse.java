package ma.sayhome.say_home_api.prospectProperty.dto;

import java.util.List;

public record ProspectPropertyRecordResponse(
        Integer id,
        Integer propertyId,
        String propertyTitle,
        String propertyType,
        String propertySector,
        Float propertyPrice,
        String propertyStatus,
        String relationStatus,
        Float finalPrice,
        Float monthlyRent,
        Float securityDeposit,
        String leaseStartDate,
        Integer leaseDurationMonths,
        String notes,
        String createdAt,
        String updatedAt,
        List<String> medias,
        List<ProspectPropertyDocumentResponse> documents,
        List<ProspectPropertyExpectedDocumentResponse> expectedDocuments,
        List<ProspectPropertyInteractionResponse> interactions
) {
}
