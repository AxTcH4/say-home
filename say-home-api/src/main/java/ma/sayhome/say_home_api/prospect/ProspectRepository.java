package ma.sayhome.say_home_api.prospect;

import ma.sayhome.say_home_api.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProspectRepository extends JpaRepository<Prospect,Integer> {
    Prospect findByUser(User authenticatedUser);

    List<Prospect> findByUser_FirstNameContainingIgnoreCase(String q);
    List<Prospect> findByUser_LastNameContainingIgnoreCase(String q);
}
