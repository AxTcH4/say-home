package ma.sayhome.say_home_api.property;

import ma.sayhome.say_home_api.appointment.Appointment;
import ma.sayhome.say_home_api.shared.ServiceBase;
import org.springframework.stereotype.Service;

import java.util.List;

public interface PropertyService extends ServiceBase <Property, Integer> {
    @Override
    public Property create(Property entity);

    @Override
    public Property findById(Integer integer);

    @Override
    public List<Property> findAll();

    @Override
    public Property update(Integer integer, Property entity);

    @Override
    public void delete(Integer integer);
}
