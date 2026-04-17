package ma.sayhome.say_home_api.property.propertyMedia;

import ma.sayhome.say_home_api.property.Property;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyMediaRepository  extends JpaRepository<PropertyMedia,Integer> {
    PropertyMedia save(PropertyMedia entity);
    void delete(PropertyMedia entity);
    PropertyMedia findById(int id);
    PropertyMedia findByUrl(String url);

}
