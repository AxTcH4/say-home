package ma.sayhome.say_home_api.property.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import ma.sayhome.say_home_api.user.dto.UserDTO;
import ma.sayhome.say_home_api.property.Property;
import ma.sayhome.say_home_api.shared.enums.PropertySecteur;
import ma.sayhome.say_home_api.shared.enums.PropertyStatus;
import ma.sayhome.say_home_api.shared.enums.PropertyType;

import java.util.List;
import lombok.Data;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PropertyDTO {
    private Integer id;
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
    private PropertyStatus status;
    private UserDTO agent;
    private List<String> medias;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Integer agent_id;
    //Mappers
    public static PropertyDTO toDTO(Property property) {
        PropertyDTO dto = new PropertyDTO();
        dto.setId(property.getId());
        dto.setTitle(property.getTitle());
        dto.setDescription(property.getDescription());
        dto.setType(property.getType());
        dto.setSecteur(property.getSecteur());
        dto.setPrice(property.getPrice());
        dto.setSurface(property.getSurface());
        dto.setRooms(property.getRooms());
        dto.setBathrooms(property.getBathrooms());
        dto.setClimatisation(property.getClimatisation());
        dto.setPiscine(property.getPiscine());
        dto.setJardin(property.getJardin());
        dto.setGarage(property.getGarage());
        dto.setSecurite(property.getSecurite());
        dto.setSystemeDomotiqueComplet(property.getSystemeDomotiqueComplet());
        dto.setStatus(property.getStatus());
        //dto.setAgent(property.getAgent());
        dto.setAgent(UserDTO.toDTO(property.getAgent()));
//        dto.setMedias(files);
    //    dto.setMedias(property.getMedia().stream()
      //          .map(PropertyMedia::getUrl)
        //        .collect(Collectors.toList()));
        return dto;
    }

    public static Property toEntity(PropertyDTO propertyDTO) {
        Property property = new Property();
        property.setTitle(propertyDTO.getTitle());
        property.setDescription(propertyDTO.getDescription());
        property.setType(propertyDTO.getType());
        property.setSecteur(propertyDTO.getSecteur());
        property.setPrice(propertyDTO.getPrice());
        property.setSurface(propertyDTO.getSurface());
        property.setRooms(propertyDTO.getRooms());
        property.setBathrooms(propertyDTO.getBathrooms());
        property.setClimatisation(propertyDTO.getClimatisation());
        property.setPiscine(propertyDTO.getPiscine());
        property.setJardin(propertyDTO.getJardin());
        property.setGarage(propertyDTO.getGarage());
        property.setSecurite(propertyDTO.getSecurite());
        property.setSystemeDomotiqueComplet(propertyDTO.getSystemeDomotiqueComplet());

        return  property;
    }
}


