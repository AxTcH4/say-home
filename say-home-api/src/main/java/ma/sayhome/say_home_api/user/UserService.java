package ma.sayhome.say_home_api.user;

public interface UserService {
    UsersResponse getUsers();
    UserListItemResponse getUserById(Integer id);
    UserListItemResponse createUser(UserRequest request);
    UserListItemResponse updateUser(Integer id, UserRequest request);
    UserListItemResponse toggleUserActive(Integer id);
}
