package ma.sayhome.say_home_api.property;

import jakarta.transaction.Transactional;
import ma.sayhome.say_home_api.notification.NotificationService;
import ma.sayhome.say_home_api.appointment.AppointmentRepository;
import ma.sayhome.say_home_api.matchingEngine.matchResult.MatchResultRepository;
import ma.sayhome.say_home_api.property.dto.PropertyDTO;
import ma.sayhome.say_home_api.property.dto.PropertyReqDTO;
import ma.sayhome.say_home_api.property.propertyMedia.PropertyMediaServiceImpl;
import ma.sayhome.say_home_api.prospectProperty.ProspectPropertyRecordService;
import ma.sayhome.say_home_api.prospectProperty.ProspectPropertyRecordRepository;
import ma.sayhome.say_home_api.shared.enums.PropertyType;
import ma.sayhome.say_home_api.shared.enums.PropertyOfferType;
import ma.sayhome.say_home_api.shared.enums.PropertyStatus;
import ma.sayhome.say_home_api.shared.enums.Role;
import ma.sayhome.say_home_api.shared.exceptions.BadRequestException;
import ma.sayhome.say_home_api.shared.exceptions.ResourceNotFoundException;
import ma.sayhome.say_home_api.user.User;
import ma.sayhome.say_home_api.user.UserRepository;
import ma.sayhome.say_home_api.wish.PropertyRecommendationService;
import ma.sayhome.say_home_api.wish.PropertyRecommendationRepository;
import ma.sayhome.say_home_api.wish.WantedPropertyRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class PropertyServiceImpl {
    private final PropertyRepository propertyRepository;
    private final PropertyMediaServiceImpl propertyMediaService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final PropertyRecommendationService propertyRecommendationService;
    private final ProspectPropertyRecordRepository prospectPropertyRecordRepository;
    private final ProspectPropertyRecordService prospectPropertyRecordService;
    private final PropertyRecommendationRepository propertyRecommendationRepository;
    private final WantedPropertyRepository wantedPropertyRepository;
    private final AppointmentRepository appointmentRepository;
    private final MatchResultRepository matchResultRepository;

    public PropertyServiceImpl(
            PropertyRepository propertyRepository,
            PropertyMediaServiceImpl propertyMediaService,
            UserRepository userRepository,
            NotificationService notificationService,
            PropertyRecommendationService propertyRecommendationService,
            ProspectPropertyRecordRepository prospectPropertyRecordRepository,
            ProspectPropertyRecordService prospectPropertyRecordService,
            PropertyRecommendationRepository propertyRecommendationRepository,
            WantedPropertyRepository wantedPropertyRepository,
            AppointmentRepository appointmentRepository,
            MatchResultRepository matchResultRepository
    ) {
        this.propertyRepository = propertyRepository;
        this.propertyMediaService = propertyMediaService;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.propertyRecommendationService = propertyRecommendationService;
        this.prospectPropertyRecordRepository = prospectPropertyRecordRepository;
        this.prospectPropertyRecordService = prospectPropertyRecordService;
        this.propertyRecommendationRepository = propertyRecommendationRepository;
        this.wantedPropertyRepository = wantedPropertyRepository;
        this.appointmentRepository = appointmentRepository;
        this.matchResultRepository = matchResultRepository;
    }

    public PropertyDTO create(PropertyReqDTO dto, List<MultipartFile> files) throws IOException {
        Property entity = PropertyReqDTO.toEntity(dto);
        validateOfferPricing(entity.getOfferType(), entity.getPrice());
        normalizeAmenities(entity);

        User agent = resolveAssignedAgent(dto.getAgentName());
        entity.setAgent(agent);
        Property saved = propertyRepository.save(entity);

        propertyMediaService.uploadAll(files, saved);
        propertyRecommendationService.recommendFor(saved);

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
        property.setOfferType(dto.getOfferType() != null ? dto.getOfferType() : PropertyOfferType.SALE);
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
        validateOfferPricing(property.getOfferType(), property.getPrice());

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

        Set<Integer> impactedProspectIds = new LinkedHashSet<>();
        prospectPropertyRecordRepository.findByPropertyId(id).forEach(record -> impactedProspectIds.add(record.getProspect().getId()));
        appointmentRepository.findByPropertyId(id).forEach(appointment -> {
            if (appointment.getProspect() != null && appointment.getProspect().getId() != null) {
                impactedProspectIds.add(appointment.getProspect().getId());
            }
        });

        propertyRecommendationRepository.deleteByPropertyId(id);
        wantedPropertyRepository.clearReferenceProperty(id);
        prospectPropertyRecordRepository.deleteByPropertyId(id);
        appointmentRepository.deleteByPropertyId(id);
        matchResultRepository.deleteByPropertyId(id);
        propertyMediaService.deleteAllByPropertyId(id);
        propertyRepository.delete(property);
        prospectPropertyRecordService.refreshProspectsAfterPropertyCleanup(impactedProspectIds);
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

    public List<PropertyDTO> findSimilarProperties(Integer propertyId, int limit) {
        Property baseProperty = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property with id " + propertyId + " not found"));

        List<Property> allProperties = propertyRepository.findAll();
        List<PropertyDTO> similarProperties = allProperties.stream()
                .filter(candidate -> !candidate.getId().equals(propertyId))
                .filter(candidate ->
                        candidate.getType() == baseProperty.getType() ||
                        candidate.getSecteur() == baseProperty.getSecteur()
                )
                .sorted(
                        Comparator
                                .comparing((Property candidate) -> candidate.getType() == baseProperty.getType())
                                .reversed()
                                .thenComparing(candidate -> candidate.getSecteur() == baseProperty.getSecteur(), Comparator.reverseOrder())
                                .thenComparing(candidate -> {
                                    Float candidatePrice = candidate.getPrice();
                                    Float basePrice = baseProperty.getPrice();
                                    if (candidatePrice == null || basePrice == null) {
                                        return Float.MAX_VALUE;
                                    }
                                    return Math.abs(candidatePrice - basePrice);
                                })
                )
                .limit(limit)
                .map(PropertyDTO::toDTO)
                .toList();

        similarProperties.forEach(this::assingMedia);
        return similarProperties;
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

    private void validateOfferPricing(PropertyOfferType offerType, Float price) {
        if (offerType == null) {
            throw new BadRequestException("Le type d'offre est obligatoire.");
        }
        if (price == null || price <= 0) {
            throw new BadRequestException(
                    offerType == PropertyOfferType.RENT
                            ? "Le loyer mensuel est obligatoire."
                            : "Le prix de vente est obligatoire."
            );
        }
    }
}
