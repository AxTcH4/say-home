package ma.sayhome.say_home_api.property;

import ma.sayhome.say_home_api.property.propertyMedia.PropertyMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PropertyRepository extends JpaRepository <Property,Integer> {
}
