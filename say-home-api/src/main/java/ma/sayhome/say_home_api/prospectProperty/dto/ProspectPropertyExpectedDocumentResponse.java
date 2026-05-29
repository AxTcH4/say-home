package ma.sayhome.say_home_api.prospectProperty.dto;

public record ProspectPropertyExpectedDocumentResponse(
        String type,
        String title,
        String description,
        String sampleContent,
        boolean uploaded
) {
}
