package ma.sayhome.say_home_api.property;
import ma.sayhome.say_home_api.property.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Integer> {
    List<Property> findTop3ByOrderByCreatedAtDesc();
    List<Property> findByTypeOrderByCreatedAtDesc(String type);
    List<Property> findByTitleContainingIgnoreCase(String q);
    List<Property> findByDescriptionContainingIgnoreCase(String q);

    long countByStatus(String status);

    @Query("SELECT MONTH(p.createdAt), COUNT(p) FROM Property p WHERE YEAR(p.createdAt) = :year GROUP BY MONTH(p.createdAt) ORDER BY MONTH(p.createdAt)")
    List<Object[]> countPerMonth(@Param("year") int year);
}

