package ma.sayhome.say_home_api.property.propertyMedia;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PropertyMediaRepository  extends JpaRepository<PropertyMedia,Integer> {
}
