package ma.sayhome.say_home_api.property;

import jakarta.transaction.Transactional;
import ma.sayhome.say_home_api.auth.User;
import ma.sayhome.say_home_api.auth.UserRepository;
import ma.sayhome.say_home_api.property.dto.PropertyDTO;
import ma.sayhome.say_home_api.property.dto.PropertyReqDTO;
import ma.sayhome.say_home_api.property.propertyMedia.PropertyMediaServiceImp;
import ma.sayhome.say_home_api.shared.exceptions.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class PropertyServiceImp {

    @Autowired
    private PropertyRepository propertyRepository;
    @Autowired
    private PropertyMediaServiceImp propertyMediaService;
    @Autowired
    private UserRepository userRepository;

    public PropertyDTO create(PropertyReqDTO dto, List<MultipartFile> files) throws IOException {
        //convert to entity
        Property entity = PropertyReqDTO.toEntity(dto);

        //set agent
        String [] dividedName = dto.getAgentName().split(" ");
        User agent = userRepository.findByFirstNameAndLastName(dividedName[0], dividedName[1]);

        if (agent == null) {
            throw new ResourceNotFoundException("Agent not found");
        }

        entity.setAgent(agent);

        //if uploaded save property
        Property saved = propertyRepository.save(entity);

        List <String> medias = propertyMediaService.uploadAll(files, saved);
        PropertyDTO resultDTO = PropertyDTO.toDTO(saved);
        assingMedia(resultDTO);
        //Map to DTO (with urls)
        return resultDTO;

}

    public List <PropertyDTO> findAll() {
        List<Property> properties = propertyRepository.findAll();
        List<PropertyDTO> resultsDTO = new ArrayList<>();
        for(Property property : properties) {
            PropertyDTO rDTO = PropertyDTO.toDTO(property);
            assingMedia(rDTO);
            resultsDTO.add(rDTO);
        }
        return resultsDTO;
    }
    public void assingMedia (PropertyDTO property) {
//            find media
        List<String> medias = propertyMediaService.getByPropertyId(property.getId());
//            assing media to property
        property.setMedias(medias);
    }

}
