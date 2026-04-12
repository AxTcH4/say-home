package ma.sayhome.say_home_api.prospect;

import ma.sayhome.say_home_api.appointment.Appointment;
import ma.sayhome.say_home_api.shared.ServiceBase;
import org.springframework.stereotype.Service;

import java.util.List;

public interface ProspectService extends ServiceBase <Prospect, Integer> {
    @Override
    public Prospect create(Prospect entity);

    @Override
    public Prospect findById(Integer integer);

    @Override
    public List<Prospect> findAll();

    @Override
    public Prospect update(Integer integer, Prospect entity);

    @Override
    public void delete(Integer integer);
}
