package ma.sayhome.say_home_api.auth;

import ma.sayhome.say_home_api.auth.dto.AdminUsersResponse;
import ma.sayhome.say_home_api.auth.dto.AdminUserListItemResponse;
import ma.sayhome.say_home_api.auth.dto.AdminUserRequest;

public interface AdminUserService {
    AdminUsersResponse getUsers();
    AdminUserListItemResponse getUserById(Integer id);
    AdminUserListItemResponse createUser(AdminUserRequest request);
    AdminUserListItemResponse updateUser(Integer id, AdminUserRequest request);
    AdminUserListItemResponse toggleUserActive(Integer id);
}
