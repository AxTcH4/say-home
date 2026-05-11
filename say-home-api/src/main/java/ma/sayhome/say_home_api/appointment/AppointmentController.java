package ma.sayhome.say_home_api.appointment;

import ma.sayhome.say_home_api.appointment.dto.CreateAppointmentRequest;
import ma.sayhome.say_home_api.appointment.dto.CreateVisitRequest;
import ma.sayhome.say_home_api.shared.ControllerBase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    private final AppointmentServiceImpl appointmentService;

    public AppointmentController(AppointmentServiceImpl appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping("/board")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<?> getBoard() {
        return ok(appointmentService.getBoard());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<?> getAppointment(@PathVariable Integer id) {
        return ok(appointmentService.getAppointmentDetail(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createAppointment(@RequestBody CreateAppointmentRequest request) {
        return created(appointmentService.createAppointment(request));
    }

    @PostMapping("/requests")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> createVisitRequest(@RequestBody CreateVisitRequest request) {
        return created(appointmentService.createVisitRequest(request));
    }

    @GetMapping("/requests/me")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> getMyVisitRequests() {
        return ok(appointmentService.getMyVisitRequests());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateAppointment(@PathVariable Integer id, @RequestBody CreateAppointmentRequest request) {
        return ok(appointmentService.updateAppointment(id, request));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveAppointmentRequest(@PathVariable Integer id) {
        return ok(appointmentService.approveRequest(id));
    }

    @PatchMapping("/{id}/refuse")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> refuseAppointmentRequest(@PathVariable Integer id) {
        return ok(appointmentService.refuseRequest(id));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> cancelAppointment(@PathVariable Integer id) {
        return ok(appointmentService.cancelAppointment(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAppointment(@PathVariable Integer id) {
        appointmentService.delete(id);
        return noContent();
    }
}
