package ma.sayhome.say_home_api.property;

import jakarta.transaction.Transactional;
import ma.sayhome.say_home_api.notification.NotificationService;
import ma.sayhome.say_home_api.property.dto.PropertyDTO;
import ma.sayhome.say_home_api.property.dto.PropertyReqDTO;
import ma.sayhome.say_home_api.property.propertyMedia.PropertyMediaServiceImpl;
import ma.sayhome.say_home_api.shared.enums.PropertyType;
import ma.sayhome.say_home_api.shared.enums.PropertyStatus;
import ma.sayhome.say_home_api.shared.enums.Role;
import ma.sayhome.say_home_api.shared.exceptions.BadRequestException;
import ma.sayhome.say_home_api.shared.exceptions.ResourceNotFoundException;
import ma.sayhome.say_home_api.user.User;
import ma.sayhome.say_home_api.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class PropertyServiceImpl {
    private final PropertyRepository propertyRepository;
    private final PropertyMediaServiceImpl propertyMediaService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public PropertyServiceImpl(
            PropertyRepository propertyRepository,
            PropertyMediaServiceImpl propertyMediaService,
            UserRepository userRepository,
            NotificationService notificationService
    ) {
        this.propertyRepository = propertyRepository;
        this.propertyMediaService = propertyMediaService;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public PropertyDTO create(PropertyReqDTO dto, List<MultipartFile> files) throws IOException {
        Property entity = PropertyReqDTO.toEntity(dto);
        normalizeAmenities(entity);

        User agent = resolveAssignedAgent(dto.getAgentName());
        entity.setAgent(agent);
        Property saved = propertyRepository.save(entity);

        propertyMediaService.uploadAll(files, saved);

        PropertyDTO resultDTO = PropertyDTO.toDTO(saved);
        assingMedia(resultDTO);
        if (agent != null) {
            notificationService.createNotification("You just got assigned to the property " + resultDTO.getTitle(), agent);
        }
        return resultDTO;
    }

    public PropertyDTO update(Integer id, PropertyReqDTO dto) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property with id " + id + " not found"));

        property.setTitle(dto.getTitle());
        property.setDescription(dto.getDescription());
        property.setType(dto.getType());
        property.setSecteur(dto.getSecteur());
        property.setPrice(dto.getPrice());
        property.setSurface(dto.getSurface());
        property.setRooms(dto.getRooms());
        property.setBathrooms(dto.getBathrooms());
        property.setClimatisation(Boolean.TRUE.equals(dto.getClimatisation()));
        property.setPiscine(Boolean.TRUE.equals(dto.getPiscine()));
        property.setJardin(Boolean.TRUE.equals(dto.getJardin()));
        property.setGarage(Boolean.TRUE.equals(dto.getGarage()));
        property.setSecurite(Boolean.TRUE.equals(dto.getSecurite()));
        property.setSystemeDomotiqueComplet(Boolean.TRUE.equals(dto.getSystemeDomotiqueComplet()));
        normalizeAmenities(property);

        if (dto.getStatus() != null) {
            property.setStatus(dto.getStatus());
        }

        Property saved = propertyRepository.save(property);
        PropertyDTO resultDTO = PropertyDTO.toDTO(saved);
        assingMedia(resultDTO);
        return resultDTO;
    }

    public PropertyDTO replaceImages(Integer id, List<MultipartFile> files) throws IOException {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property with id " + id + " not found"));

        propertyMediaService.replaceAll(files, property);

        PropertyDTO resultDTO = PropertyDTO.toDTO(property);
        assingMedia(resultDTO);
        return resultDTO;
    }

    public void delete(Integer id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property with id " + id + " not found"));

        propertyMediaService.deleteAllByPropertyId(id);
        propertyRepository.delete(property);
    }

    public List<PropertyDTO> findAll() {
        List<PropertyDTO> resultsDTO = new ArrayList<>();
        for (Property property : propertyRepository.findAll()) {
            PropertyDTO dto = PropertyDTO.toDTO(property);
            assingMedia(dto);
            resultsDTO.add(dto);
        }
        return resultsDTO;
    }

    public void assingMedia(PropertyDTO property) {
        property.setMedias(propertyMediaService.getByPropertyId(property.getId()));
    }

    private void normalizeAmenities(Property property) {
        PropertyType type = property.getType();

        if (type != PropertyType.VILLA && type != PropertyType.RIAD) {
            property.setPiscine(false);
            property.setJardin(false);
        }

        if (type == PropertyType.STUDIO) {
            property.setGarage(false);
        }
    }

    private User resolveAssignedAgent(String agentName) {
        if (agentName == null || agentName.isBlank()) {
            return null;
        }

        String[] dividedName = agentName.trim().split("\\s+", 2);
        if (dividedName.length < 2) {
            throw new BadRequestException("Agent name is invalid");
        }

        User agent = userRepository.findByFirstNameAndLastName(dividedName[0], dividedName[1]);
        if (agent == null) {
            throw new ResourceNotFoundException("Agent not found");
        }
        if (agent.getRole() != Role.AGENT) {
            throw new BadRequestException("Only an agent can be assigned to a property");
        }

        return agent;
    }
}
