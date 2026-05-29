package ma.sayhome.say_home_api.user;

public record UserListItemResponse(
        Integer id,
        String fullName,
        String email,
        String phone,
        String role,
        long activeProspects,
        boolean active
) {
}
