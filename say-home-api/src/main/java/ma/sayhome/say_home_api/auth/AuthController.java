package ma.sayhome.say_home_api.auth;

import ma.sayhome.say_home_api.auth.dto.*;
import ma.sayhome.say_home_api.shared.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;


    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Integer> login(@RequestHeader("Authorization") String authHeader) {
        System.out.println("Hit the endpoint!");
        String token = authHeader.replace("Bearer ", "");
        System.out.println("Auth Token: " + token);
        System.out.println("Auth Token: " + token);
        return ResponseEntity.ok(authService.logout(token));
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody RegisterRequest request) {
        return ResponseEntity.status(201).body(authService.signup(request));
    }

    @GetMapping("/verify-registration")
    public ResponseEntity<AuthResponse> verifyRegistration(@RequestParam String token) {
        System.out.println("Verifying registration token");
        return ResponseEntity.ok(authService.verifyRegistration(token));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserDto> me(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String token = extractToken(authHeader);
        return ResponseEntity.ok(authService.getCurrentUser(token));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("If that email exists, a reset link has been sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Password reset successfully"));
    }

    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
