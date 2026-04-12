package ma.sayhome.say_home_api.pipeline;

import org.apache.catalina.Pipeline;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PipelineServiceImp implements PipelineService {
    @Override
    public Pipeline create(Pipeline entity) {
        return null;
    }

    @Override
    public Pipeline findById(Integer integer) {
        return null;
    }

    @Override
    public List<Pipeline> findAll() {
        return List.of();
    }

    @Override
    public Pipeline update(Integer integer, Pipeline entity) {
        return null;
    }

    @Override
    public void delete(Integer integer) {

    }
}
