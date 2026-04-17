package ma.sayhome.say_home_api.auth;

import ma.sayhome.say_home_api.auth.dto.*;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    Integer logout (String request);
    AuthResponse signup(RegisterRequest request);
    AuthResponse verifyRegistration(String token);
    AuthResponse.UserDto getCurrentUser(String token);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}
