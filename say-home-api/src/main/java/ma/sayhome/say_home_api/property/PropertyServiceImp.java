package ma.sayhome.say_home_api.property;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PropertyServiceImp implements PropertyService {
    @Override
    public Property create(Property entity) {
        return null;
    }

    @Override
    public Property findById(Integer integer) {
        return null;
    }

    @Override
    public List<Property> findAll() {
        return List.of();
    }

    @Override
    public Property update(Integer integer, Property entity) {
        return null;
    }

    @Override
    public void delete(Integer integer) {

    }
}
