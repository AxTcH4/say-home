package ma.sayhome.say_home_api.prospectProperty.dto;

import ma.sayhome.say_home_api.prospectProperty.document.ProspectPropertyDocument;

public record ProspectPropertyDocumentResponse(
        Integer id,
        String name,
        String url,
        String downloadPath,
        String type,
        String uploadedAt
) {
    public static ProspectPropertyDocumentResponse fromEntity(ProspectPropertyDocument document, String uploadedAt) {
        return new ProspectPropertyDocumentResponse(
                document.getId(),
                document.getName(),
                document.getUrl(),
                "/api/prospect-properties/documents/" + document.getId() + "/download",
                document.getType().name(),
                uploadedAt
        );
    }
}
