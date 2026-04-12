package com.sayhome.sayhomeapi.controller;

import com.sayhome.sayhomeapi.entity.Property;
import com.sayhome.sayhomeapi.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "http://localhost:3000")
public class PropertyController {

    @Autowired
    private PropertyRepository propertyRepository;

    // GET /api/properties/latest - Home Page
    @GetMapping("/latest")
public ResponseEntity<Map<String, Object>> getLatestProperties(
        @RequestParam(required = false) String type) {
    List<Property> properties;
    if (type != null && !type.isEmpty()) {
        properties = propertyRepository.findByTypeOrderByCreatedAtDesc(type);
    } else {
        properties = propertyRepository.findTop3ByOrderByCreatedAtDesc();
    }
    Map<String, Object> response = new HashMap<>();
    response.put("success", true);
    response.put("data", properties);
    return ResponseEntity.ok(response);
}

    // GET /api/properties - Liste des biens
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllProperties(
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {
        List<Property> properties = propertyRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", properties);
        return ResponseEntity.ok(response);
    }

    // GET /api/properties/:id - Détail d'un bien
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPropertyById(@PathVariable Integer id) {
        Optional<Property> property = propertyRepository.findById(id);
        Map<String, Object> response = new HashMap<>();
        if (property.isPresent()) {
            List<Property> similar = propertyRepository.findTop3ByOrderByCreatedAtDesc();
            response.put("success", true);
            response.put("data", property.get());
            response.put("similar", similar);
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Bien non trouvé");
            return ResponseEntity.status(404).body(response);
        }
    }

    // POST /api/properties - Créer un bien
    @PostMapping
    public ResponseEntity<Map<String, Object>> createProperty(@RequestBody Property property) {
        Property saved = propertyRepository.save(property);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", saved);
        return ResponseEntity.status(201).body(response);
    }
}