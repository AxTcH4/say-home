package ma.sayhome.say_home_api.automation;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AutomationServiceImp implements  AutomationService {
    @Override
    public AutomationRule create(AutomationRule entity) {
        return null;
    }

    @Override
    public AutomationRule findById(Integer integer) {
        return null;
    }

    @Override
    public List<AutomationRule> findAll() {
        return List.of();
    }

    @Override
    public AutomationRule update(Integer integer, AutomationRule entity) {
        return null;
    }

    @Override
    public void delete(Integer integer) {

    }
}
