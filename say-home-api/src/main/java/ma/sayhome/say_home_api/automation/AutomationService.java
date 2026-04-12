package ma.sayhome.say_home_api.automation;

import ma.sayhome.say_home_api.appointment.Appointment;
import ma.sayhome.say_home_api.shared.ServiceBase;
import org.springframework.stereotype.Service;

import java.util.List;

public interface AutomationService extends ServiceBase <AutomationRule, Integer> {
    @Override
    public AutomationRule create(AutomationRule entity);

    @Override
    public AutomationRule findById(Integer integer);

    @Override
    public List<AutomationRule> findAll();

    @Override
    public AutomationRule update(Integer integer, AutomationRule entity);

    @Override
    public void delete(Integer integer);
}
