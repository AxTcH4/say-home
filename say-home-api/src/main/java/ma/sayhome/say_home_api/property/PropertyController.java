package ma.sayhome.say_home_api.property;

import ma.sayhome.say_home_api.property.dto.PropertyDTO;
import ma.sayhome.say_home_api.property.dto.PropertyReqDTO;
import ma.sayhome.say_home_api.shared.ApiResponse;
import ma.sayhome.say_home_api.shared.ControllerBase;
import ma.sayhome.say_home_api.shared.exceptions.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "http://localhost:3000")
public class PropertyController extends ControllerBase {

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private PropertyServiceImp propertyService;

    // GET /api/properties/latest - Home Page
    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<List<PropertyDTO>>> getLatestProperties(@RequestParam(required = false) String type) {
        System.out.println("Hits the endpoint");
        List<Property> properties = new ArrayList<>();

        if (type != null && !type.isEmpty()) {
            properties = propertyRepository.findByTypeOrderByCreatedAtDesc(type);
        } else {
            properties = propertyRepository.findTop3ByOrderByCreatedAtDesc();
        }

        List<PropertyDTO> results = new ArrayList<>();

//        //find Media and Map properties with DTO
        for (Property property : properties) {
            System.out.println("Property id: " + property.getId());
            System.out.println("Title: " + property.getTitle());

            PropertyDTO propertyDTO = PropertyDTO.toDTO(property);
            propertyService.assingMedia(propertyDTO);
            results.add(propertyDTO);
        }

        System.out.println("Latest properties: " + results.toString());
        return ok(results);
}

    // GET /api/properties - Liste des biens
    @GetMapping
    public ResponseEntity<ApiResponse<List<PropertyDTO>>> getAllProperties(
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {

        List<Property> properties = propertyRepository.findAll();
        List<PropertyDTO> results = new ArrayList<>();

//        //find Media and Map properties with DTO
        for (Property property : properties) {
            System.out.println("Property id: " + property.getId());
            System.out.println("Title: " + property.getTitle());

            PropertyDTO propertyDTO = PropertyDTO.toDTO(property);
            propertyService.assingMedia(propertyDTO);
            results.add(propertyDTO);
        }

        System.out.println("Latest properties: " + results.toString());
        return ok(results);
    }

    // GET /api/properties/:id - Détail d'un bien
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PropertyDTO>> getPropertyById(@PathVariable Integer id) {
        Optional<Property> property = propertyRepository.findById(id);
//        Map<String, Object> response = new HashMap<>();
        if (property.isPresent()) {
            //      find Media and Map properties with DTO

            PropertyDTO propertyDTO = PropertyDTO.toDTO(property.get());

            System.out.println("Property id: " + propertyDTO.getId());
            System.out.println("Title: " + propertyDTO.getTitle());

            propertyService.assingMedia(propertyDTO);

            return ok(propertyDTO);
        }
        else {
            throw  new ResourceNotFoundException("Property with id " + id + " not found");
        }
//
//            List<Property> similar = propertyRepository.findTop3ByOrderByCreatedAtDesc();
//            response.put("success", true);
//            response.put("data", property.get());
//            response.put("similar", similar);
//            return ResponseEntity.ok(response);
//        } else {
//            response.put("success", false);
//            response.put("message", "Bien non trouvé");
//            return ResponseEntity.status(404).body(response);

    }

    // POST /api/properties - Créer un bienu
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PropertyDTO>> createProperty(@RequestPart("property") PropertyReqDTO property,
                                                                   @RequestPart("files") List<MultipartFile> files) throws IOException {

        //forward post request to service
        PropertyDTO saved = propertyService.create(property, files);

        return ok(saved);
    }
}