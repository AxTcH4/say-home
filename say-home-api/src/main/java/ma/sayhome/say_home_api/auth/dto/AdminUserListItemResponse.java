package ma.sayhome.say_home_api.auth.dto;

public record AdminUserListItemResponse(
        Integer id,
        String fullName,
        String email,
        String phone,
        String role,
        long activeProspects,
        boolean active
) {
}
