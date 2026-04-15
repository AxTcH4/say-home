package ma.sayhome.say_home_api.auth;

import ma.sayhome.say_home_api.shared.exceptions.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthServiceImp implements AuthService {

    @Autowired
    private UserRepository userRepository;
    @Override
    public User create(User entity) {
        return null;
    }

    @Override
    public User findById(Integer integer) {
        return null;
    }

    @Override
    public List<User> findAll() {
        return List.of();
    }

    @Override
    public User update(Integer integer, User entity) {
        return null;
    }

    @Override
    public void delete(Integer integer) {

    }
    public User findByFullName(String firstName, String lastName) {
        return userRepository.findByFirstNameAndLastName(firstName, lastName);
    }

}
