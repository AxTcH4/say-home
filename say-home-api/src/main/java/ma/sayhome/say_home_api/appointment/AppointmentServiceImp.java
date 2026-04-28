package ma.sayhome.say_home_api.appointment;

import ma.sayhome.say_home_api.appointment.dto.AppointmentDetailResponse;
import ma.sayhome.say_home_api.appointment.dto.AppointmentsBoardResponse;
import ma.sayhome.say_home_api.appointment.dto.CreateAppointmentRequest;
import ma.sayhome.say_home_api.appointment.dto.MeetingEventResponse;
import ma.sayhome.say_home_api.appointment.dto.MeetingRequestResponse;
import ma.sayhome.say_home_api.auth.User;
import ma.sayhome.say_home_api.auth.UserRepository;
import ma.sayhome.say_home_api.property.Property;
import ma.sayhome.say_home_api.property.PropertyRepository;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.prospect.ProspectRepository;
import ma.sayhome.say_home_api.shared.enums.AppointmentStatus;
import ma.sayhome.say_home_api.shared.enums.ProspectStatus;
import ma.sayhome.say_home_api.shared.enums.Role;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

@Service
public class AppointmentServiceImp implements AppointmentService {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter RANGE_FORMATTER = DateTimeFormatter.ofPattern("MMMM yyyy");

    private final AppointmentRepository appointmentRepository;
    private final ProspectRepository prospectRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;

    public AppointmentServiceImp(
            AppointmentRepository appointmentRepository,
            ProspectRepository prospectRepository,
            UserRepository userRepository,
            PropertyRepository propertyRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.prospectRepository = prospectRepository;
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
    }

    public AppointmentsBoardResponse getBoard() {
        User currentUser = getCurrentUser();
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        List<Appointment> scopedAppointments = appointmentRepository.findAll().stream()
                .filter(appointment -> isAdmin || isOwnedBy(appointment, currentUser))
                .toList();

        List<Integer> plannedProspectIds = scopedAppointments.stream()
                .filter(appointment -> appointment.getProspect() != null)
                .filter(appointment -> appointment.getStatus() != AppointmentStatus.CANCELLED)
                .map(appointment -> appointment.getProspect().getId())
                .distinct()
                .toList();

        List<MeetingRequestResponse> requests = isAdmin
                ? prospectRepository.findAll().stream()
                    .filter(prospect -> prospect.getStatus() == ProspectStatus.NEW
                            || prospect.getStatus() == ProspectStatus.CONTACTED
                            || prospect.getStatus() == ProspectStatus.QUALIFIED)
                    .filter(prospect -> !plannedProspectIds.contains(prospect.getId()))
                    .sorted(Comparator.comparing(Prospect::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                    .limit(6)
                    .map(prospect -> new MeetingRequestResponse(
                            prospect.getId(),
                            prospect.getId(),
                            prospect.getFirstName() + " " + prospect.getLastName(),
                            prospect.getCity() == null ? "" : prospect.getCity(),
                            formatBudget(prospect.getBudget()),
                            prospect.getCreatedAt() != null ? DATE_FORMATTER.format(prospect.getCreatedAt()) : "",
                            prospect.getSource() == null ? "" : prospect.getSource()
                    ))
                    .toList()
                : List.of();

        List<MeetingEventResponse> events = scopedAppointments.stream()
                .sorted(Comparator.comparing(Appointment::getDate))
                .map(this::toMeetingEvent)
                .toList();

        return new AppointmentsBoardResponse(
                RANGE_FORMATTER.format(LocalDate.now()) + " - Week " + LocalDate.now().get(java.time.temporal.IsoFields.WEEK_OF_WEEK_BASED_YEAR),
                requests,
                events
        );
    }

    public AppointmentDetailResponse getAppointmentDetail(Integer id) {
        Appointment appointment = getRequiredAppointment(id);
        assertCanView(appointment);
        return toDetail(appointment);
    }

    public AppointmentDetailResponse createAppointment(CreateAppointmentRequest request) {
        assertAdmin();
        Appointment appointment = new Appointment();
        applyRequest(appointment, request);
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        Appointment saved = appointmentRepository.save(appointment);
        return toDetail(saved);
    }

    public AppointmentDetailResponse updateAppointment(Integer id, CreateAppointmentRequest request) {
        assertAdmin();
        Appointment appointment = getRequiredAppointment(id);
        applyRequest(appointment, request);
        Appointment saved = appointmentRepository.save(appointment);
        return toDetail(saved);
    }

    public AppointmentDetailResponse cancelAppointment(Integer id) {
        assertAdmin();
        Appointment appointment = getRequiredAppointment(id);
        appointment.setStatus(AppointmentStatus.CANCELLED);
        Appointment saved = appointmentRepository.save(appointment);
        return toDetail(saved);
    }

    @Override
    public Appointment create(Appointment entity) {
        return appointmentRepository.save(entity);
    }

    @Override
    public Appointment findById(Integer integer) {
        Appointment appointment = getRequiredAppointment(integer);
        assertCanView(appointment);
        return appointment;
    }

    @Override
    public List<Appointment> findAll() {
        User currentUser = getCurrentUser();
        return appointmentRepository.findAll().stream()
                .filter(appointment -> currentUser.getRole() == Role.ADMIN || isOwnedBy(appointment, currentUser))
                .toList();
    }

    @Override
    public Appointment update(Integer integer, Appointment entity) {
        assertAdmin();
        Appointment existing = getRequiredAppointment(integer);
        entity.setId(existing.getId());
        return appointmentRepository.save(entity);
    }

    @Override
    public void delete(Integer integer) {
        assertAdmin();
        appointmentRepository.delete(getRequiredAppointment(integer));
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private void assertAdmin() {
        if (getCurrentUser().getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can manage meetings");
        }
    }

    private void assertCanView(Appointment appointment) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == Role.ADMIN) {
            return;
        }

        if (!isOwnedBy(appointment, currentUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only view your own meetings");
        }
    }

    private boolean isOwnedBy(Appointment appointment, User currentUser) {
        return appointment.getAgent() != null
                && appointment.getAgent().getId() != null
                && appointment.getAgent().getId().equals(currentUser.getId());
    }

    private Appointment getRequiredAppointment(Integer id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
    }

    private void applyRequest(Appointment appointment, CreateAppointmentRequest request) {
        if (request.prospectId == null || request.agentId == null || request.date == null || request.time == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Prospect, agent, date and time are required");
        }

        LocalDate appointmentDate = LocalDate.parse(request.date);
        LocalTime appointmentTime = LocalTime.parse(request.time);
        LocalDateTime appointmentDateTime = LocalDateTime.of(appointmentDate, appointmentTime);

        if (appointmentDateTime.isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot schedule a meeting in the past");
        }

        Prospect prospect = prospectRepository.findById(request.prospectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Prospect not found"));
        User agent = userRepository.findById(request.agentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Agent not found"));

        Property property = null;
        if (request.propertyId != null) {
            property = propertyRepository.findById(request.propertyId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Property not found"));
        }

        appointment.setProspect(prospect);
        appointment.setAgent(agent);
        appointment.setProperty(property);
        appointment.setMeetingType(request.meetingType == null || request.meetingType.isBlank() ? "Call" : request.meetingType.trim());
        appointment.setNotes(request.notes == null ? "" : request.notes.trim());
        appointment.setDate(appointmentDateTime);
        if (appointment.getStatus() == null) {
            appointment.setStatus(AppointmentStatus.SCHEDULED);
        }
    }

    private AppointmentDetailResponse toDetail(Appointment appointment) {
        return new AppointmentDetailResponse(
                appointment.getId(),
                appointment.getProspect() != null ? appointment.getProspect().getId() : null,
                appointment.getProspect() != null ? appointment.getProspect().getFirstName() + " " + appointment.getProspect().getLastName() : "",
                appointment.getAgent() != null ? appointment.getAgent().getId() : null,
                appointment.getAgent() != null ? appointment.getAgent().getFirstName() + " " + appointment.getAgent().getLastName() : "",
                appointment.getProperty() != null ? appointment.getProperty().getId() : null,
                DATE_FORMATTER.format(appointment.getDate()),
                TIME_FORMATTER.format(appointment.getDate()),
                appointment.getMeetingType() == null ? "Call" : appointment.getMeetingType(),
                appointment.getNotes() == null ? "" : appointment.getNotes(),
                appointment.getStatus() != null ? appointment.getStatus().name() : AppointmentStatus.SCHEDULED.name()
        );
    }

    private MeetingEventResponse toMeetingEvent(Appointment appointment) {
        String type = appointment.getMeetingType() == null ? "Call" : appointment.getMeetingType();
        String startTime = TIME_FORMATTER.format(appointment.getDate());
        String endTime = TIME_FORMATTER.format(appointment.getDate().plusHours(1));
        return new MeetingEventResponse(
                appointment.getId(),
                appointment.getProspect() != null ? appointment.getProspect().getId() : null,
                appointment.getProspect() != null ? appointment.getProspect().getFirstName() + " " + appointment.getProspect().getLastName() : "Meeting",
                appointment.getAgent() != null ? appointment.getAgent().getFirstName() + " " + appointment.getAgent().getLastName() : "",
                appointment.getProperty() != null ? appointment.getProperty().getTitle() : "No property",
                type,
                appointment.getStatus() != null ? appointment.getStatus().name() : AppointmentStatus.SCHEDULED.name(),
                appointment.getDate().getDayOfWeek().name(),
                DATE_FORMATTER.format(appointment.getDate()),
                startTime,
                endTime,
                resolveColor(type)
        );
    }

    private String resolveColor(String type) {
        return switch (type.toUpperCase()) {
            case "VISIT" -> "#5bc28c";
            case "URGENT" -> "#f1b84b";
            case "INTERNAL" -> "#8d69f8";
            default -> "#5f8dff";
        };
    }

    private String formatBudget(Float budget) {
        if (budget == null) return "Not specified";
        if (budget >= 1_000_000) return String.format("%.1fM", budget / 1_000_000f);
        return String.format("%.0fk", budget / 1_000f);
    }
}
