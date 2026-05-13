package ma.sayhome.say_home_api.helpDesk.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmailRequest {
    private String email;
    private String subject;
    private String greeting;
    private String body;
    private String footnote;




}
