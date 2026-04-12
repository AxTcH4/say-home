package ma.sayhome.say_home_api.notification;

import ma.sayhome.say_home_api.appointment.Appointment;
import ma.sayhome.say_home_api.shared.ServiceBase;
import org.springframework.stereotype.Service;

import java.util.List;

public interface NotificationService extends ServiceBase <Notification, Integer> {
    @Override
    public Notification create(Notification entity);

    @Override
    public Notification findById(Integer integer);

    @Override
    public List<Notification> findAll();

    @Override
    public Notification update(Integer integer, Notification entity);

    @Override
    public void delete(Integer integer);
}
