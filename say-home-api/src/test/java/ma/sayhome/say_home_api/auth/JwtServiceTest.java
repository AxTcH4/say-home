package ma.sayhome.say_home_api.auth;

import ma.sayhome.say_home_api.shared.enums.Role;
import ma.sayhome.say_home_api.user.User;
import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private static final String SECRET = "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=";

    @Test
    void generateToken_shouldEmbedUserClaims() {
        JwtService jwtService = new JwtService(SECRET, 3600);
        User user = buildUser(7, "agent@sayhome.ma", Role.AGENT);

        String token = jwtService.generateToken(user);

        assertNotNull(token);
        assertEquals("agent@sayhome.ma", jwtService.extractEmail(token));
        assertTrue(jwtService.isTokenValid(token, user));
    }

    @Test
    void isTokenValid_shouldReturnFalseForDifferentUser() {
        JwtService jwtService = new JwtService(SECRET, 3600);
        User owner = buildUser(7, "agent@sayhome.ma", Role.AGENT);
        User other = buildUser(9, "other@sayhome.ma", Role.CLIENT);

        String token = jwtService.generateToken(owner);

        assertFalse(jwtService.isTokenValid(token, other));
    }

    @Test
    void isTokenValid_shouldThrowForExpiredToken() {
        JwtService expiredJwtService = new JwtService(SECRET, -1);
        User user = buildUser(7, "agent@sayhome.ma", Role.AGENT);

        String token = expiredJwtService.generateToken(user);

        assertThrows(ExpiredJwtException.class, () -> expiredJwtService.isTokenValid(token, user));
    }

    private User buildUser(int id, String email, Role role) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setRole(role);
        return user;
    }
}
