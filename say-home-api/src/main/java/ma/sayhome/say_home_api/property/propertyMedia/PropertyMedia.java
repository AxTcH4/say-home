package ma.sayhome.say_home_api.property.propertyMedia;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import ma.sayhome.say_home_api.property.Property;
import ma.sayhome.say_home_api.shared.EntityBase;

@Data
@ToString(exclude = {"agent", "media", "appointments", "matchResults"})
@Entity
@Table(name = "property_media")
public class PropertyMedia extends EntityBase {

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

}