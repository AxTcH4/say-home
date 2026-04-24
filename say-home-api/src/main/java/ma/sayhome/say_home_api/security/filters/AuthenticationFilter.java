package ma.sayhome.say_home_api.security.filters;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
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

            System.out.println("Filter hit: " + request.getRequestURI());

        System.out.println("==== REQUEST DEBUG ====");
        System.out.println("URI: " + request.getRequestURI());
        System.out.println("Method: " + request.getMethod());
        System.out.println("RemoteAddr: " + request.getRemoteAddr());

            Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            System.out.println("No cookies found");
            filterChain.doFilter(request, response);
            return;
            }

        if (cookies == null) {
            System.out.println("Cookies: NULL");
        } else {
            System.out.println("Cookies:");
            for (Cookie c : cookies) {
                System.out.println(" - " + c.getName() + " = " + c.getValue());
            }
        }


        System.out.println("Headers:");
        var headerNames = request.getHeaderNames();

        while (headerNames.hasMoreElements()) {
            String name = headerNames.nextElement();
            System.out.println(" - " + name + ": " + request.getHeader(name));
        }

        System.out.println("Origin: " + request.getHeader("Origin"));
        System.out.println("Host: " + request.getHeader("Host"));

            String token = "";
            for(Cookie c: cookies) {
                System.out.println(c.getName() +  ": " + c.getValue());
                if(c.getName().equals("token")) {
                    token = c.getValue();
                    break;
                }
            }
            System.out.println("token: " + token);
            if (token == null || token.isBlank()) {
                filterChain.doFilter(request, response);
                return;
            }
            System.out.println("searching userToken...");
            UserToken userToken = userTokenRepository.findByToken(token);
            if (userToken == null) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
                return; // stop here, don't continue the filter chain
            }
            System.out.println("finding userToken in DB...");

            User authUser = userToken.getUser();
            System.out.println("userToken is found in DB");
            //set context
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(authUser, null, authUser.getAuthorities());

            SecurityContextHolder.getContext().setAuthentication(auth);
            System.out.println("Security context set for: " + authUser.getEmail());
            System.out.println("Authorities: " + authUser.getAuthorities());

            filterChain.doFilter(request, response);
            System.out.print("Forwarded request to controller!!");

        }
}
