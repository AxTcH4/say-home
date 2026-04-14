package com.sayhome.sayhomeapi.repository;

import com.sayhome.sayhomeapi.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Integer> {
    List<Property> findTop3ByOrderByCreatedAtDesc();
    List<Property> findByTypeOrderByCreatedAtDesc(String type);
}