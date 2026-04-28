package ma.sayhome.say_home_api.auth.dto;

import java.util.List;

public record AdminUsersResponse(
        List<AdminUserListItemResponse> items,
        long total
) {
}
