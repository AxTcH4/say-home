package ma.sayhome.say_home_api.prospect.dto;

public record ProspectWishResponse(
        Integer id,
        String date,
        String source,
        boolean submitted,
        String title,
        String summary
) {
}
