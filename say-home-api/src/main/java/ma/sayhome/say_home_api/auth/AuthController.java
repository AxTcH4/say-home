package ma.sayhome.say_home_api.auth;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import ma.sayhome.say_home_api.auth.dto.AuthDTO;
import ma.sayhome.say_home_api.shared.ApiResponse;
import ma.sayhome.say_home_api.shared.ControllerBase;
import ma.sayhome.say_home_api.shared.exceptions.UnauthorizedException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController extends ControllerBase {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }


    @PostMapping("/login")
    public ResponseEntity<AuthDTO.AuthResponse> login(@RequestBody AuthDTO.LoginRequest request, HttpServletResponse response) {
        AuthDTO.AuthResponse auth = authService.login(request);
        response.addCookie(buildAuthCookie(auth.getToken(), 7 * 24 * 60 * 60));
        return ResponseEntity.ok(new AuthDTO.AuthResponse("Login successful", null, auth.getUser()));
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Integer> logout(HttpServletRequest request, HttpServletResponse response) {
        String token = extractTokenFromCookies(request);
        response.addCookie(buildAuthCookie("", 0));
        return ResponseEntity.ok(authService.logout(token));
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthDTO.AuthResponse> signup(@RequestBody AuthDTO.RegisterRequest request) {
        return ResponseEntity.status(201).body(authService.signup(request));
    }

    @GetMapping("/verify-registration")
    public ResponseEntity<AuthDTO.AuthResponse> verifyRegistration(@RequestParam String token, HttpServletResponse response) {
        AuthDTO.AuthResponse auth = authService.verifyRegistration(token);
        response.addCookie(buildAuthCookie(auth.getToken(), 7 * 24 * 60 * 60));
        return ResponseEntity.ok(new AuthDTO.AuthResponse(auth.getMessage(), null, auth.getUser()));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AuthDTO.AuthResponse.UserDto> me(Authentication authentication) {
        return ResponseEntity.ok(authService.getCurrentUser((ma.sayhome.say_home_api.user.User) authentication.getPrincipal()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestBody AuthDTO.ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("If that email exists, a reset link has been sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody AuthDTO.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Password reset successfully"));
    }

    private String extractTokenFromCookies(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            throw new UnauthorizedException("No authentication cookie found");
        }

        for (Cookie cookie : cookies) {
            if ("token".equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank()) {
                return cookie.getValue();
            }
        }

        throw new UnauthorizedException("Authentication token is required");
    }

    private Cookie buildAuthCookie(String token, int maxAge) {
        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);
        return cookie;
    }
}
