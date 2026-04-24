package ma.sayhome.say_home_api.auth;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import ma.sayhome.say_home_api.auth.dto.*;
import ma.sayhome.say_home_api.shared.ApiResponse;
import ma.sayhome.say_home_api.shared.ControllerBase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.AbstractController;

@RestController
@RequestMapping("/api/auth")
public class AuthController extends ControllerBase {
    @Autowired
    private AuthService authService;


    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request, HttpServletResponse response) {

        System.out.println("Hit the endpoint");
        AuthResponse auth = authService.login(request);
        //set up cookies HttpOnly
        Cookie cookie = new Cookie("token", auth.getToken());
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60);
        //TODO: ADD cookie.secure(true) when deploying

        response.addCookie(cookie);
        System.out.println("Auth Response:" + auth.getUser());
        return ResponseEntity.ok(new AuthResponse("Login successful", null, auth.getUser()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Integer> logout(HttpServletRequest request, HttpServletResponse response) {
        System.out.println("Hit the endpoint!");
        Cookie [] cookies = request.getCookies();
        if (cookies == null) {
            throw new RuntimeException("No cookies found");
        }
        String token = "";
        for(Cookie c: cookies) {
            if(c.getName().equals("token")) {
                token = c.getValue();
                break;
            }
        }
        if(token.isBlank()) {
            throw new RuntimeException("token is null");
        }
        Cookie cookie = new Cookie("token", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        System.out.println("Login out...");
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
            HttpServletRequest request) {
        System.out.println("Hit the endpoint!");
        Cookie [] cookies = request.getCookies();
        if (cookies == null) {
            throw new RuntimeException("No cookies found");
        }
        String token = "";
        for(Cookie c: cookies) {
            if(c.getName().equals("token")) {
                token = c.getValue();
                break;
            }
        }

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

//    private String extractToken(String authHeader) {
//        if (authHeader != null && authHeader.startsWith("Bearer ")) {
//            return authHeader.substring(7);
//        }
//        return null;
//    }
}
