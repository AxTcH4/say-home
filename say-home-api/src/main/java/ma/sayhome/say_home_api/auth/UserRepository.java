package ma.sayhome.say_home_api.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    Optional<User> findByToken(String token);
    User findByFirstNameAndLastName(String firstName, String lastName);

}
