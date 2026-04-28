package ma.sayhome.say_home_api.appointment;

import ma.sayhome.say_home_api.shared.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository <Appointment,Integer> {
    List<Appointment> findByStatusOrderByCreatedAtDesc(AppointmentStatus status);
    List<Appointment> findByProspectUserIdOrderByCreatedAtDesc(Integer userId);
}
