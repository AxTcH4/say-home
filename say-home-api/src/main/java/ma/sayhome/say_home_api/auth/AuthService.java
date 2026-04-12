package ma.sayhome.say_home_api.auth;

import ma.sayhome.say_home_api.appointment.Appointment;
import ma.sayhome.say_home_api.shared.ServiceBase;
import org.springframework.stereotype.Service;

import java.util.List;

public interface AuthService extends ServiceBase<User, Integer> {
    @Override
    public User create(User entity);

    @Override
    public User findById(Integer integer);

    @Override
    public List<User> findAll();

    @Override
    public User update(Integer integer, User entity);

    @Override
    public void delete(Integer integer);
}
