package ma.sayhome.say_home_api.user;

import java.util.List;

public record UsersResponse(
        List<UserListItemResponse> items,
        long total
) {
}
