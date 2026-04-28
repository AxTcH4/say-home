package ma.sayhome.say_home_api.appointment;

import ma.sayhome.say_home_api.appointment.dto.CreateAppointmentRequest;
import ma.sayhome.say_home_api.appointment.dto.CreateVisitRequest;
import ma.sayhome.say_home_api.shared.ControllerBase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController extends ControllerBase {
    private final AppointmentServiceImp appointmentService;

    public AppointmentController(AppointmentServiceImp appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping("/board")
    public ResponseEntity<?> getBoard() {
        return ok(appointmentService.getBoard());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointment(@PathVariable Integer id) {
        return ok(appointmentService.getAppointmentDetail(id));
    }

    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody CreateAppointmentRequest request) {
        return created(appointmentService.createAppointment(request));
    }

    @PostMapping("/requests")
        public ResponseEntity<?> createVisitRequest(@RequestBody CreateVisitRequest request) {
            System.out.println("Landed in the controller");
            return created(appointmentService.createVisitRequest(request));
    }

    @GetMapping("/requests/me")
    public ResponseEntity<?> getMyVisitRequests() {
        return ok(appointmentService.getMyVisitRequests());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAppointment(@PathVariable Integer id, @RequestBody CreateAppointmentRequest request) {
        return ok(appointmentService.updateAppointment(id, request));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approveAppointmentRequest(@PathVariable Integer id) {
        return ok(appointmentService.approveRequest(id));
    }

    @PatchMapping("/{id}/refuse")
    public ResponseEntity<?> refuseAppointmentRequest(@PathVariable Integer id) {
        return ok(appointmentService.refuseRequest(id));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Integer id) {
        return ok(appointmentService.cancelAppointment(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable Integer id) {
        appointmentService.delete(id);
        return noContent();
    }
}
