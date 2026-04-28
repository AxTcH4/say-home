package ma.sayhome.say_home_api.prospect.dto;

public record ProspectInteractionResponse(
        Integer id,
        String type,
        String date,
        String comment
) {
}
