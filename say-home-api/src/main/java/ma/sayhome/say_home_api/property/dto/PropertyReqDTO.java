package ma.sayhome.say_home_api.property.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.sayhome.say_home_api.property.Property;
import ma.sayhome.say_home_api.shared.enums.PropertySecteur;
import ma.sayhome.say_home_api.shared.enums.PropertyStatus;
import ma.sayhome.say_home_api.shared.enums.PropertyType;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyReqDTO {

    private String title;
    private String description;
    private PropertyType type;
    private PropertySecteur secteur;
    private Float price;
    private Integer surface;
    private Integer rooms;
    private Integer bathrooms;
    private Boolean climatisation;
    private Boolean piscine;
    private Boolean jardin;
    private Boolean garage;
    private Boolean securite;
    private Boolean systemeDomotiqueComplet;
    private String agentName;
    private PropertyStatus status;



    public static Property toEntity(PropertyReqDTO propertyDTO) {
        Property property = new Property();
        property.setTitle(propertyDTO.getTitle());
        property.setDescription(propertyDTO.getDescription());
        property.setType(propertyDTO.getType());
        property.setSecteur(propertyDTO.getSecteur());
        property.setPrice(propertyDTO.getPrice());
        property.setSurface(propertyDTO.getSurface());
        property.setRooms(propertyDTO.getRooms());
        property.setBathrooms(propertyDTO.getBathrooms());
        property.setClimatisation(Boolean.TRUE.equals(propertyDTO.getClimatisation()));
        property.setPiscine(Boolean.TRUE.equals(propertyDTO.getPiscine()));
        property.setJardin(Boolean.TRUE.equals(propertyDTO.getJardin()));
        property.setGarage(Boolean.TRUE.equals(propertyDTO.getGarage()));
        property.setSecurite(Boolean.TRUE.equals(propertyDTO.getSecurite()));
        property.setSystemeDomotiqueComplet(Boolean.TRUE.equals(propertyDTO.getSystemeDomotiqueComplet()));
        property.setStatus(propertyDTO.getStatus() != null ? propertyDTO.getStatus() : PropertyStatus.AVAILABLE);

        return  property;
    }

}
