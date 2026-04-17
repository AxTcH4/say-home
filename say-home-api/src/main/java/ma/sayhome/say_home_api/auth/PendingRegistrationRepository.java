package ma.sayhome.say_home_api.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PendingRegistrationRepository extends JpaRepository<PendingRegistration, Integer> {
    boolean existsByEmail(String email);
    Optional<PendingRegistration> findByEmail(String email);
    Optional<PendingRegistration> findByVerificationToken(String token);
}