package ma.sayhome.say_home_api.notification;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationServiceImp implements NotificationService {
    @Override
    public Notification create(Notification entity) {
        return null;
    }

    @Override
    public Notification findById(Integer integer) {
        return null;
    }

    @Override
    public List<Notification> findAll() {
        return List.of();
    }

    @Override
    public Notification update(Integer integer, Notification entity) {
        return null;
    }

    @Override
    public void delete(Integer integer) {

    }
}
