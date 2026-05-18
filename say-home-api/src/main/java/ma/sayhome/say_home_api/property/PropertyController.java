package ma.sayhome.say_home_api.property;

import ma.sayhome.say_home_api.property.dto.PropertyDTO;
import ma.sayhome.say_home_api.property.dto.PropertyReqDTO;
import ma.sayhome.say_home_api.property.propertyMedia.PropertyMediaServiceImpl;
import ma.sayhome.say_home_api.shared.ApiResponse;
import ma.sayhome.say_home_api.shared.ControllerBase;
import ma.sayhome.say_home_api.shared.exceptions.ResourceNotFoundException;
import ma.sayhome.say_home_api.shared.enums.PropertyType;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/properties")
public class PropertyController extends ControllerBase {
    private final PropertyRepository propertyRepository;
    private final PropertyServiceImpl propertyService;

    public PropertyController(PropertyRepository propertyRepository, PropertyServiceImpl propertyService) {
        this.propertyRepository = propertyRepository;
        this.propertyService = propertyService;
    }

    @Autowired
    private PropertyMediaServiceImpl propertyMediaService;

    // GET /api/properties/latest - Home Page
    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<List<PropertyDTO>>> getLatestProperties(@RequestParam(required = false) String type) {
        PropertyType propertyType = (type != null && !type.isBlank())
                ? PropertyType.fromStorageValue(type)
                : null;

        List<Property> properties = propertyType != null
                ? propertyRepository.findByTypeOrderByCreatedAtDesc(propertyType)
                : propertyRepository.findTop3ByOrderByCreatedAtDesc();

        List<PropertyDTO> results = new ArrayList<>();
        for (Property property : properties) {
            PropertyDTO propertyDTO = PropertyDTO.toDTO(property);
            propertyService.assingMedia(propertyDTO);
            results.add(propertyDTO);
        }

        return ok(results);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PropertyDTO>>> getAllProperties(
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice
    ) {
        List<PropertyDTO> results = new ArrayList<>();
        for (Property property : propertyRepository.findAll()) {
            PropertyDTO propertyDTO = PropertyDTO.toDTO(property);
            propertyService.assingMedia(propertyDTO);
            results.add(propertyDTO);
        }

        return ok(results);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PropertyDTO>> getPropertyById(@PathVariable Integer id) {
        Optional<Property> property = propertyRepository.findById(id);
        if (property.isEmpty()) {
            throw new ResourceNotFoundException("Property with id " + id + " not found");
        }

        PropertyDTO propertyDTO = PropertyDTO.toDTO(property.get());
        propertyService.assingMedia(propertyDTO);
        return ok(propertyDTO);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PropertyDTO>> createProperty(
            @RequestPart("property") PropertyReqDTO property,
            @RequestPart("files") List<MultipartFile> files
    ) throws IOException {
        return ok(propertyService.create(property, files));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PropertyDTO>> updateProperty(
            @PathVariable Integer id,
            @RequestBody PropertyReqDTO property
    ) {
        return ok(propertyService.update(id, property));
    }

    @PostMapping(path = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PropertyDTO>> replacePropertyImages(
            @PathVariable Integer id,
            @RequestPart("files") List<MultipartFile> files
    ) throws IOException {
        return ok(propertyService.replaceImages(id, files));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProperty(@PathVariable Integer id) {
        propertyService.delete(id);
        return ok(null);
    }
}

