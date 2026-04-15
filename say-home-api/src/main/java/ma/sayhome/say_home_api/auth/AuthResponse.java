package ma.sayhome.say_home_api.auth;

public class AuthResponse {

    private String message;
    private String token;
    private UserDto user;

    public AuthResponse(String message) {
        this.message = message;
    }

    public AuthResponse(String message, String token, User user) {
        this.message = message;
        this.token = token;
        this.user = new UserDto(user);
    }

    public String getMessage() { return message; }
    public String getToken() { return token; }
    public UserDto getUser() { return user; }

    public static class UserDto {
        private Integer id;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String role;

        public UserDto(User user) {
            this.id = user.getId();
            this.firstName = user.getFirstName();
            this.lastName = user.getLastName();
            this.email = user.getEmail();
            this.phone = user.getPhone();
            this.role = user.getRole() != null ? user.getRole().name() : null;
        }

        public Integer getId() { return id; }
        public String getFirstName() { return firstName; }
        public String getLastName() { return lastName; }
        public String getEmail() { return email; }
        public String getPhone() { return phone; }
        public String getRole() { return role; }
    }
}
