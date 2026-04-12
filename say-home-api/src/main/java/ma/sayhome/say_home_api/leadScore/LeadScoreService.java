package ma.sayhome.say_home_api.leadScore;

import ma.sayhome.say_home_api.appointment.Appointment;
import ma.sayhome.say_home_api.shared.ServiceBase;
import org.springframework.stereotype.Service;

import java.util.List;

public interface LeadScoreService extends ServiceBase <LeadScore, Integer> {
    @Override
    public LeadScore create(LeadScore entity);

    @Override
    public LeadScore findById(Integer integer);

    @Override
    public List<LeadScore> findAll();

    @Override
    public LeadScore update(Integer integer, LeadScore entity);

    @Override
    public void delete(Integer integer);
}
