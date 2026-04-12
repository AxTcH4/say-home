package ma.sayhome.say_home_api.appointment;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentServiceImp implements AppointmentService {

    @Override
    public Appointment create(Appointment entity) {
        return null;
    }

    @Override
    public Appointment findById(Integer integer) {
        return null;
    }

    @Override
    public List<Appointment> findAll() {
        return List.of();
    }

    @Override
    public Appointment update(Integer integer, Appointment entity) {
        return null;
    }

    @Override
    public void delete(Integer integer) {

    }
}