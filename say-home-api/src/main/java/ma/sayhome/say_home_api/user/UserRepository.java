package ma.sayhome.say_home_api.user;

import ma.sayhome.say_home_api.shared.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    Optional<User> findByToken(String token);
    User findByFirstNameAndLastName(String firstName, String lastName);

    Optional<User> findUserByFirstNameAndLastName(String s, String s1);

    List<User> findByRole(Role role);
}
