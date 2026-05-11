package ma.sayhome.say_home_api.auth;

import ma.sayhome.say_home_api.auth.dto.AuthDTO;

public interface AuthService {
    AuthDTO.AuthResponse login(AuthDTO.LoginRequest request);
    Integer logout (String request);
    AuthDTO.AuthResponse signup(AuthDTO.RegisterRequest request);
    AuthDTO.AuthResponse verifyRegistration(String token);
    AuthDTO.AuthResponse.UserDto getCurrentUser(ma.sayhome.say_home_api.user.User user);
    void forgotPassword(AuthDTO.ForgotPasswordRequest request);
    void resetPassword(AuthDTO.ResetPasswordRequest request);
}
