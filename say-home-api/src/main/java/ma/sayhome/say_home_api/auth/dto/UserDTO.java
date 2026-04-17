package ma.sayhome.say_home_api.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.sayhome.say_home_api.auth.User;

import java.util.Optional;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Integer id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;

    public static UserDTO toDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setFirstName(user.getFirstName());
        userDTO.setLastName(user.getLastName());
        userDTO.setEmail(user.getEmail());
        userDTO.setRole(user.getRole().toString());
        return userDTO;
}
}

