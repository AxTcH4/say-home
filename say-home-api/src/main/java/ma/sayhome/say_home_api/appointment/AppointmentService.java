package ma.sayhome.say_home_api.appointment;

import ma.sayhome.say_home_api.shared.ServiceBase;
import org.springframework.stereotype.Service;

import java.util.List;

public interface AppointmentService extends ServiceBase <Appointment, Integer> {

    @Override
    public Appointment create(Appointment entity);

    @Override
    public Appointment findById(Integer integer);
    @Override
    public List<Appointment> findAll();

    @Override
    public Appointment update(Integer integer, Appointment entity);

    @Override
    public void delete(Integer integer);
}