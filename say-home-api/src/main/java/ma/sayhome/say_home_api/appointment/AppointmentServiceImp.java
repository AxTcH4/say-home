package ma.sayhome.say_home_api.appointment;

import ma.sayhome.say_home_api.appointment.dto.AppointmentDetailResponse;
import ma.sayhome.say_home_api.appointment.dto.AppointmentsBoardResponse;
import ma.sayhome.say_home_api.appointment.dto.ClientVisitRequestResponse;
import ma.sayhome.say_home_api.appointment.dto.CreateAppointmentRequest;
import ma.sayhome.say_home_api.appointment.dto.CreateVisitRequest;
import ma.sayhome.say_home_api.appointment.dto.MeetingEventResponse;
import ma.sayhome.say_home_api.appointment.dto.MeetingRequestResponse;
import ma.sayhome.say_home_api.auth.User;
import ma.sayhome.say_home_api.auth.UserRepository;
import ma.sayhome.say_home_api.notification.NotificationService;
import ma.sayhome.say_home_api.pipeline.PipelineStage;
import ma.sayhome.say_home_api.pipeline.PipelineStageRepository;
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
    private final PipelineStageRepository pipelineStageRepository;
    private final NotificationService notificationService;

    public AppointmentServiceImp(
            AppointmentRepository appointmentRepository,
            ProspectRepository prospectRepository,
            UserRepository userRepository, ProspectRepository propsectRepository,
            PropertyRepository propertyRepository,
            PipelineStageRepository pipelineStageRepository,
            NotificationService notificationService
    ) {
        this.appointmentRepository = appointmentRepository;
        this.prospectRepository = prospectRepository;
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.pipelineStageRepository = pipelineStageRepository;
        this.notificationService = notificationService;
    }

    public AppointmentsBoardResponse getBoard() {
        User currentUser = getCurrentUser();
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        List<Appointment> allAppointments = appointmentRepository.findAll();

        List<Appointment> scopedAppointments = allAppointments.stream()
                .filter(appointment -> appointment.getStatus() != AppointmentStatus.REQUESTED)
                .filter(appointment -> appointment.getStatus() != AppointmentStatus.REFUSED)
                .filter(appointment -> isAdmin || isOwnedBy(appointment, currentUser))
                .toList();

        List<MeetingRequestResponse> requests = isAdmin
                ? allAppointments.stream()
                    .filter(appointment -> appointment.getStatus() == AppointmentStatus.REQUESTED)
                    .sorted(Comparator.comparing(Appointment::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                    .map(this::toMeetingRequest)
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
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        Appointment saved = appointmentRepository.save(appointment);
        notifyClientForStatus(saved, "Votre demande de rendez-vous a ete acceptee et planifiee.");
        return toDetail(saved);
    }

    public ClientVisitRequestResponse createVisitRequest(CreateVisitRequest request) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != Role.CLIENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only clients can send visit requests");
        }

        if (request.propertyId == null || request.date == null || request.date.isBlank() || request.time == null || request.time.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Property, date and time are required");
        }

        Property property = propertyRepository.findById(request.propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Property not found"));

        Prospect prospect = getOrCreateProspectForUser(currentUser, property);
        LocalDateTime appointmentDateTime = parseAppointmentDateTime(request.date, request.time);

        if (appointmentDateTime.isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot request a meeting in the past");
        }

        Appointment appointment = new Appointment();
        appointment.setProspect(prospect);
        appointment.setProperty(property);
        appointment.setAgent(property.getAgent());
        appointment.setDate(appointmentDateTime);
        appointment.setMeetingType("Visit");
        appointment.setNotes(request.message == null ? "" : request.message.trim());
        appointment.setStatus(AppointmentStatus.REQUESTED);

        Appointment saved = appointmentRepository.save(appointment);
        notificationService.createNotificationsForRole(
                currentUser.getFullName() + " requested a visit for " + property.getTitle(),
                Role.ADMIN
        );

        return toClientRequest(saved);
    }

    public List<ClientVisitRequestResponse> getMyVisitRequests() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != Role.CLIENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only clients can view their visit requests");
        }

        return appointmentRepository.findByProspectUserIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                .map(this::toClientRequest)
                .toList();
    }

    public List<ClientVisitRequestResponse> getVisitRequestsByProspect(int id) {
//        User currentUser = getCurrentUser();*
          Prospect prospect = prospectRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Prospect not found"));

        List <ClientVisitRequestResponse> results =  appointmentRepository.findByProspectUserIdOrderByCreatedAtDesc(prospect.getUser().getId()).stream()
                .map(this::toClientRequest)
                .toList();

        System.out.println("Visits requested by prospect with Id" +  prospect.getId() + ": ");
        for (ClientVisitRequestResponse res : results) {
            System.out.println(res);
        }
        return results;
    }

    public AppointmentDetailResponse approveRequest(Integer id) {
        assertAdmin();
        Appointment appointment = getRequiredAppointment(id);
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        Appointment saved = appointmentRepository.save(appointment);
        notifyClientForStatus(saved, "Votre demande de rendez-vous a ete acceptee.");
        return toDetail(saved);
    }

    public AppointmentDetailResponse refuseRequest(Integer id) {
        assertAdmin();
        Appointment appointment = getRequiredAppointment(id);
        appointment.setStatus(AppointmentStatus.REFUSED);
        Appointment saved = appointmentRepository.save(appointment);
        notifyClientForStatus(saved, "Votre demande de rendez-vous a ete refusee.");
        return toDetail(saved);
    }

    public AppointmentDetailResponse cancelAppointment(Integer id) {
        assertAdmin();
        Appointment appointment = getRequiredAppointment(id);
        appointment.setStatus(AppointmentStatus.CANCELLED);
        Appointment saved = appointmentRepository.save(appointment);
        notifyClientForStatus(saved, "Votre rendez-vous a ete annule.");
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

        LocalDateTime appointmentDateTime = parseAppointmentDateTime(request.date, request.time);

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

    private LocalDateTime parseAppointmentDateTime(String date, String time) {
        LocalDate appointmentDate = LocalDate.parse(date);
        LocalTime appointmentTime = LocalTime.parse(time);
        return LocalDateTime.of(appointmentDate, appointmentTime);
    }

    private AppointmentDetailResponse toDetail(Appointment appointment) {
        return new AppointmentDetailResponse(
                appointment.getId(),
                appointment.getProspect() != null ? appointment.getProspect().getId() : null,
                appointment.getProspect() != null ? effectiveProspectName(appointment.getProspect()) : "",
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

    private MeetingRequestResponse toMeetingRequest(Appointment appointment) {
        Prospect prospect = appointment.getProspect();
        Property property = appointment.getProperty();

        return new MeetingRequestResponse(
                appointment.getId(),
                prospect != null ? prospect.getId() : null,
                prospect != null ? effectiveProspectName(prospect) : "Prospect",
                prospect != null && prospect.getCity() != null ? prospect.getCity() : "",
                prospect != null ? formatBudget(prospect.getBudget()) : "Not specified",
                DATE_FORMATTER.format(appointment.getDate()),
                TIME_FORMATTER.format(appointment.getDate()),
                appointment.getNotes() == null ? "" : appointment.getNotes(),
                property != null ? property.getId() : null,
                property != null ? property.getTitle() : "",
                appointment.getStatus().name()
        );
    }

    private ClientVisitRequestResponse toClientRequest(Appointment appointment) {
        Property property = appointment.getProperty();
        return new ClientVisitRequestResponse(
                appointment.getId(),
                property != null ? property.getId() : null,
                property != null ? property.getTitle() : "Bien indisponible",
                DATE_FORMATTER.format(appointment.getDate()),
                TIME_FORMATTER.format(appointment.getDate()),
                appointment.getNotes() == null ? "" : appointment.getNotes(),
                appointment.getStatus().name(),
                appointment.getAgent() != null ? appointment.getAgent().getFullName() : ""
        );
    }

    private MeetingEventResponse toMeetingEvent(Appointment appointment) {
        String type = appointment.getMeetingType() == null ? "Call" : appointment.getMeetingType();
        String startTime = TIME_FORMATTER.format(appointment.getDate());
        String endTime = TIME_FORMATTER.format(appointment.getDate().plusHours(1));
        return new MeetingEventResponse(
                appointment.getId(),
                appointment.getProspect() != null ? appointment.getProspect().getId() : null,
                appointment.getProspect() != null ? effectiveProspectName(appointment.getProspect()) : "Meeting",
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

    private Prospect getOrCreateProspectForUser(User currentUser, Property property) {
        Prospect existingProspect = prospectRepository.findByUser(currentUser);
        if (existingProspect != null) {
            if (existingProspect.getAssignedAgent() == null) {
                existingProspect.setAssignedAgent(property.getAgent());
            }
            if (existingProspect.getStage() == null) {
                existingProspect.setStage(getOrCreateDefaultStage());
            }
            if (existingProspect.getSource() == null || existingProspect.getSource().isBlank()) {
                existingProspect.setSource("Property Visit Request");
            }
            return prospectRepository.save(existingProspect);
        }

        Prospect prospect = new Prospect();
        prospect.setFirstName(currentUser.getFirstName());
        prospect.setLastName(currentUser.getLastName());
        prospect.setEmail(currentUser.getEmail());
        prospect.setPhone(currentUser.getPhone());
        prospect.setUser(currentUser);
        prospect.setAssignedAgent(property.getAgent());
        prospect.setBudget(property.getPrice());
        prospect.setSource("Property Visit Request");
        prospect.setStatus(ProspectStatus.NEW);
        prospect.setStage(getOrCreateDefaultStage());
        return prospectRepository.save(prospect);
    }

    private PipelineStage getOrCreateDefaultStage() {
        return pipelineStageRepository.findAll().stream()
                .filter(stage -> "New Lead".equalsIgnoreCase(stage.getName()) || "NEW".equalsIgnoreCase(stage.getName()))
                .findFirst()
                .orElseGet(() -> {
                    PipelineStage stage = new PipelineStage();
                    stage.setName("New Lead");
                    return pipelineStageRepository.save(stage);
                });
    }

    private void notifyClientForStatus(Appointment appointment, String message) {
        Prospect prospect = appointment.getProspect();
        if (prospect != null && prospect.getUser() != null) {
            notificationService.createNotification(message, prospect.getUser());
        }
    }

    private String effectiveProspectName(Prospect prospect) {
        String firstName = firstNonBlank(
                prospect.getFirstName(),
                prospect.getUser() != null ? prospect.getUser().getFirstName() : null
        );
        String lastName = firstNonBlank(
                prospect.getLastName(),
                prospect.getUser() != null ? prospect.getUser().getLastName() : null
        );
        return (firstName + " " + lastName).trim();
    }

    private String firstNonBlank(String primary, String fallback) {
        if (primary != null && !primary.isBlank()) {
            return primary;
        }
        if (fallback != null && !fallback.isBlank()) {
            return fallback;
        }
        return "";
    }
}
