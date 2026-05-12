package ma.sayhome.say_home_api.prospectProperty.dto;

public record ProspectPropertyInteractionResponse(
        Integer id,
        String type,
        String date,
        String comment
) {
}
