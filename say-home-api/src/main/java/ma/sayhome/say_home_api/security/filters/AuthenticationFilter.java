package ma.sayhome.say_home_api.security.filters;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
<<<<<<< HEAD
import ma.sayhome.say_home_api.auth.JwtService;
import ma.sayhome.say_home_api.user.User;
import ma.sayhome.say_home_api.user.UserRepository;
=======
import ma.sayhome.say_home_api.auth.User;
import ma.sayhome.say_home_api.auth.UserToken;
import ma.sayhome.say_home_api.auth.UserTokenRepository;
import ma.sayhome.say_home_api.shared.exceptions.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
>>>>>>> feature/chatbot-agent
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class AuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Value("${sayhome.internalKey}")
    private String internalKey;

    @Override
<<<<<<< HEAD
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        Cookie[] cookies = request.getCookies();
=======
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

            System.out.println("Filter hit: " + request.getRequestURI());

        System.out.println("==== REQUEST DEBUG ====");
        System.out.println("URI: " + request.getRequestURI());
        System.out.println("Method: " + request.getMethod());
        System.out.println("RemoteAddr: " + request.getRemoteAddr());

        if (request.getHeader("X-Internal-Key")!=null &&  internalKey.equals(request.getHeader("X-Internal-Key"))){
            System.out.println("X-Internal-key found");

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                            "internal-service",
                            null,
                            List.of()
                    );

            SecurityContextHolder.getContext().setAuthentication(auth);

            filterChain.doFilter(request, response);
            return;
        }

            Cookie[] cookies = request.getCookies();
>>>>>>> feature/chatbot-agent
        if (cookies == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = "";
        for (Cookie c : cookies) {
            if ("token".equals(c.getName())) {
                token = c.getValue();
                break;
            }
        }
        if (token == null || token.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String email = jwtService.extractEmail(token);
            Optional<User> user = userRepository.findByEmail(email);
            if (user.isEmpty() || !jwtService.isTokenValid(token, user.get())) {
                filterChain.doFilter(request, response);
                return;
            }

            User authUser = user.get();
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(authUser, null, authUser.getAuthorities());

            SecurityContextHolder.getContext().setAuthentication(auth);
        } catch (Exception ignored) {
            filterChain.doFilter(request, response);
            return;
        }
        filterChain.doFilter(request, response);
    }
}
