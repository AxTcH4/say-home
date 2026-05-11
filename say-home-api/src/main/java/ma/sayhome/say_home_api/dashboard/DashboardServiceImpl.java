package ma.sayhome.say_home_api.dashboard;

import ma.sayhome.say_home_api.dashboard.dto.DashboardProfileResponse;
import ma.sayhome.say_home_api.dashboard.dto.DashboardProfileUpdateRequest;
import ma.sayhome.say_home_api.dashboard.dto.DashboardStatsResponse;
import ma.sayhome.say_home_api.dashboard.dto.DashboardSummaryResponse;
import ma.sayhome.say_home_api.user.User;
import ma.sayhome.say_home_api.user.UserRepository;
import ma.sayhome.say_home_api.helpDesk.ticket.Ticket;
import ma.sayhome.say_home_api.helpDesk.ticket.TicketRepository;
import ma.sayhome.say_home_api.leadScore.LeadScore;
import ma.sayhome.say_home_api.leadScore.LeadScoreRepository;
import ma.sayhome.say_home_api.property.PropertyRepository;
import ma.sayhome.say_home_api.prospect.ProspectRepository;
import ma.sayhome.say_home_api.shared.enums.TicketStatus;
import ma.sayhome.say_home_api.shared.exceptions.BadRequestException;
import ma.sayhome.say_home_api.shared.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final ProspectRepository prospectRepository;
    private final PropertyRepository propertyRepository;
    private final TicketRepository ticketRepository;
    private final LeadScoreRepository leadScoreRepository;

    public DashboardServiceImpl(UserRepository userRepository,
                                ProspectRepository prospectRepository,
                                PropertyRepository propertyRepository,
                                TicketRepository ticketRepository,
                                LeadScoreRepository leadScoreRepository) {
        this.userRepository = userRepository;
        this.prospectRepository = prospectRepository;
        this.propertyRepository = propertyRepository;
        this.ticketRepository = ticketRepository;
        this.leadScoreRepository = leadScoreRepository;
    }

    @Override
    public DashboardProfileResponse getProfile(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return toProfileResponse(user);
    }

    @Override
    public DashboardProfileResponse updateProfile(Integer userId, DashboardProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.firstName == null || request.firstName.isBlank()) {
            throw new BadRequestException("First name is required");
        }

        if (request.lastName == null || request.lastName.isBlank()) {
            throw new BadRequestException("Last name is required");
        }

        user.setFirstName(request.firstName.trim());
        user.setLastName(request.lastName.trim());
        user.setPhone(request.phone == null ? null : request.phone.trim());

        User savedUser = userRepository.save(user);
        return toProfileResponse(savedUser);
    }

    private DashboardProfileResponse toProfileResponse(User user) {
        return new DashboardProfileResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone()
        );
    }

    @Override
    public DashboardSummaryResponse getSummary(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return new DashboardSummaryResponse(0, 0, 0, 0);
    }

    @Override
    public DashboardStatsResponse getStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        // ── Counts ──────────────────────────────────────────────────────────
        stats.setTotalProspects(prospectRepository.count());
        stats.setAvailableProperties(propertyRepository.countByStatus("AVAILABLE"));
        stats.setReservedProperties(propertyRepository.countByStatus("RESERVED"));
        stats.setSoldProperties(propertyRepository.countByStatus("SOLD"));
        stats.setTotalProperties(propertyRepository.count());
        stats.setTotalTickets(ticketRepository.count());
        stats.setOpenTickets(ticketRepository.countByStatus(TicketStatus.OPEN));

        long total = stats.getTotalProperties();
        long sold  = stats.getSoldProperties();
        stats.setConversionRate(total > 0 ? Math.round((sold * 100.0 / total) * 10.0) / 10.0 : 0);

        // ── Monthly properties (this year & last year) ───────────────────────
        int thisYear = LocalDate.now().getYear();
        stats.setMonthlyThisYear(buildMonthly(propertyRepository.countPerMonth(thisYear)));
        stats.setMonthlyLastYear(buildMonthly(propertyRepository.countPerMonth(thisYear - 1)));

        // ── Hot prospects (top 3 by lead score) ──────────────────────────────
        List<LeadScore> topScores = leadScoreRepository.findBestScorePerProspect();
        List<DashboardStatsResponse.HotProspect> hotProspects = topScores.stream()
                .limit(3)
                .map(ls -> new DashboardStatsResponse.HotProspect(
                        ls.getProspect().getFirstName(),
                        ls.getProspect().getLastName(),
                        ls.getProspect().getBudget(),
                        ls.getScore()
                ))
                .collect(Collectors.toList());
        stats.setHotProspects(hotProspects);

        // ── Recent tickets ───────────────────────────────────────────────────
        List<Ticket> recent = ticketRepository.findTop3ByOrderByUpdatedAtDesc();
        List<DashboardStatsResponse.RecentTicket> recentTickets = recent.stream()
                .map(t -> new DashboardStatsResponse.RecentTicket(
                        t.getId(),
                        t.getTitle(),
                        t.getDescription(),
                        t.getPriority() != null ? t.getPriority().name() : "MEDIUM",
                        t.getStatus() != null ? t.getStatus().name() : "OPEN",
                        t.getUpdatedAt() != null ? t.getUpdatedAt().toString() : ""
                ))
                .collect(Collectors.toList());
        stats.setRecentTickets(recentTickets);

        return stats;
    }

    private List<Long> buildMonthly(List<Object[]> rows) {
        Map<Integer, Long> map = rows.stream()
                .collect(Collectors.toMap(
                        r -> ((Number) r[0]).intValue(),
                        r -> ((Number) r[1]).longValue()
                ));
        List<Long> result = new ArrayList<>();
        for (int m = 1; m <= 12; m++) result.add(map.getOrDefault(m, 0L));
        return result;
    }
}
