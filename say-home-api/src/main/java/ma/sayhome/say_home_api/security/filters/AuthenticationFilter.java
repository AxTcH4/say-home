package ma.sayhome.say_home_api.security.filters;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import ma.sayhome.say_home_api.auth.User;
import ma.sayhome.say_home_api.auth.UserToken;
import ma.sayhome.say_home_api.auth.UserTokenRepository;
import ma.sayhome.say_home_api.shared.exceptions.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.naming.AuthenticationException;
import java.io.IOException;
import java.util.List;

@Component
public class AuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private UserTokenRepository userTokenRepository;

    @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
//            try {

            System.out.println("Filter hit: " + request.getRequestURI());
            String authHeader = request.getHeader("Authorization");
            System.out.println("authHeader: " + authHeader);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;        }

            String token = authHeader.substring(7).trim();
            System.out.println("token: " + token);
            if(token.equals(" ")){
                System.out.println("token is empty");
                throw new UnauthorizedException("Header is empty");
            }
            UserToken userToken = userTokenRepository.findByToken(token);
            System.out.println("finding userToken in DB...");

            User authUser = userToken.getUser();
            System.out.println("userToken is found in DB");
            //set context
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(authUser, null, List.of());

            SecurityContextHolder.getContext().setAuthentication(auth);
            System.out.println("Security context set for: " + authUser.getEmail());

            filterChain.doFilter(request, response);
            System.out.print("Forwarded request to controller!!");
//    }
//            catch (Exception e) {
//                System.out.println("Exception: " + e.getMessage());
//            }
        }
}
