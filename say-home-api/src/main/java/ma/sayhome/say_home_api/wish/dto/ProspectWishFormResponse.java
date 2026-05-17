package ma.sayhome.say_home_api.wish.dto;

public record ProspectWishFormResponse(
        String token,
        String prospectName,
        String propertyTitle,
        boolean submitted
) {
}
