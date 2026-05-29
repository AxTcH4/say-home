package ma.sayhome.say_home_api.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import ma.sayhome.say_home_api.user.User;

public final class AuthDTO {
    private AuthDTO() {
    }

    @Data
    public static class LoginRequest {
        public String email;
        public String password;
    }

    @Data
    public static class RegisterRequest {
        public String firstName;
        public String lastName;
        public String email;
        public String phone;
        public String password;
        public String confirmPassword;
    }

    @Data
    public static class ForgotPasswordRequest {
        public String email;
    }

    @Data
    public static class ResetPasswordRequest {
        public String token;
        public String password;
        public String newPassword;
        public String confirmPassword;

        public String getEffectivePassword() {
            return password != null ? password : newPassword;
        }
    }

    @Data
    public static class LogoutRequest {
        private String token;
    }

    @Data
    @AllArgsConstructor
    public static class AuthResponse {
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

        @Data
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
        }
    }
}
