package ma.sayhome.say_home_api.pipeline;

import ma.sayhome.say_home_api.appointment.Appointment;
import ma.sayhome.say_home_api.shared.ServiceBase;
import org.apache.catalina.Pipeline;
import org.springframework.stereotype.Service;

import java.util.List;

public interface PipelineService extends ServiceBase <Pipeline, Integer> {
    @Override
    public Pipeline create(Pipeline entity);

    @Override
    public Pipeline findById(Integer integer);

    @Override
    public List<Pipeline> findAll();

    @Override
    public Pipeline update(Integer integer, Pipeline entity) ;

    @Override
    public void delete(Integer integer);
}
