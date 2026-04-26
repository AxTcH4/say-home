package ma.sayhome.say_home_api.notification;

import ma.sayhome.say_home_api.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    void deleteByCreatedAtBefore(LocalDateTime date);
}