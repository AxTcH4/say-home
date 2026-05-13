package ma.sayhome.say_home_api.property.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.sayhome.say_home_api.property.Property;
import ma.sayhome.say_home_api.shared.enums.PropertyStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyReqDTO {

    private String title;
    private String description;
    private String type;
    private String secteur;
    private Float price;
    private Integer surface;
    private Integer rooms;
    private String agentName;
<<<<<<< HEAD
    private PropertyStatus status;
=======
    private String status;
>>>>>>> feature/chatbot-agent



    public static Property toEntity(PropertyReqDTO propertyDTO) {
        Property property = new Property();
        property.setTitle(propertyDTO.getTitle());
        property.setDescription(propertyDTO.getDescription());
        property.setType(propertyDTO.getType());
        property.setSecteur(propertyDTO.getSecteur());
        property.setPrice(propertyDTO.getPrice());
        property.setSurface(propertyDTO.getSurface());
        property.setRooms(propertyDTO.getRooms());
<<<<<<< HEAD
        property.setStatus(propertyDTO.getStatus() != null ? propertyDTO.getStatus() : PropertyStatus.AVAILABLE);
=======
        property.setStatus(propertyDTO.getStatus() != null ? propertyDTO.getStatus() : "AVAILABLE");
>>>>>>> feature/chatbot-agent

        return  property;
    }

}
