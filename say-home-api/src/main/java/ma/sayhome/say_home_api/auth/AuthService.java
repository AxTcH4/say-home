package ma.sayhome.say_home_api.auth;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse signup(RegisterRequest request);
    AuthResponse verifyRegistration(String token);
    AuthResponse.UserDto getCurrentUser(String token);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}
