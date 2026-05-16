package ma.sayhome.say_home_api.helpDesk.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OwnedPropertyContextDTO {
    private Integer recordId;
    private Integer propertyId;
    private String title;
    private String secteur;
    private String type;
    private String relationStatus;
}
