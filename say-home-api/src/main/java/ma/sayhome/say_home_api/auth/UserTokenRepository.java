package ma.sayhome.say_home_api.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserTokenRepository extends JpaRepository<UserToken, Long> {
    @Modifying
    @Query("DELETE FROM UserToken t WHERE t.token = :token")
    int deleteByToken(@Param("token") String token);
}
