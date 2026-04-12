package ma.sayhome.say_home_api.property.propertyMedia;

import jakarta.persistence.*;
import ma.sayhome.say_home_api.property.Property;

@Entity
@Table(name = "property_media")
public class PropertyMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String url;

    @Column(nullable = false)
    private String type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    // getters + setters
}