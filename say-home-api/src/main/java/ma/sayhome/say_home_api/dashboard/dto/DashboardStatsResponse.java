package ma.sayhome.say_home_api.dashboard.dto;

import java.util.List;

public class DashboardStatsResponse {

    private long totalProspects;
    private long availableProperties;
    private long reservedProperties;
    private long soldProperties;
    private long totalProperties;
    private long openTickets;
    private long totalTickets;
    private double conversionRate;

    private List<Long> monthlyThisYear;
    private List<Long> monthlyLastYear;

    private List<HotProspect> hotProspects;
    private List<RecentTicket> recentTickets;

    // ─── Nested DTOs ──────────────────────────────────────────────────────────

    public static class HotProspect {
        private String firstName;
        private String lastName;
        private Float budget;
        private Float score;

        public HotProspect(String firstName, String lastName, Float budget, Float score) {
            this.firstName = firstName;
            this.lastName = lastName;
            this.budget = budget;
            this.score = score;
        }

        public String getFirstName() { return firstName; }
        public String getLastName()  { return lastName; }
        public Float  getBudget()    { return budget; }
        public Float  getScore()     { return score; }
    }

    public static class RecentTicket {
        private Integer id;
        private String title;
        private String description;
        private String priority;
        private String status;
        private String createdAt;

        public RecentTicket(Integer id, String title, String description,
                            String priority, String status, String createdAt) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.priority = priority;
            this.status = status;
            this.createdAt = createdAt;
        }

        public Integer getId()          { return id; }
        public String  getTitle()       { return title; }
        public String  getDescription() { return description; }
        public String  getPriority()    { return priority; }
        public String  getStatus()      { return status; }
        public String  getCreatedAt()   { return createdAt; }
    }

    // ─── Constructor ──────────────────────────────────────────────────────────

    public DashboardStatsResponse() {}

    // ─── Getters / Setters ────────────────────────────────────────────────────

    public long   getTotalProspects()      { return totalProspects; }
    public void   setTotalProspects(long v){ totalProspects = v; }

    public long   getAvailableProperties()       { return availableProperties; }
    public void   setAvailableProperties(long v) { availableProperties = v; }

    public long   getReservedProperties()       { return reservedProperties; }
    public void   setReservedProperties(long v) { reservedProperties = v; }

    public long   getSoldProperties()       { return soldProperties; }
    public void   setSoldProperties(long v) { soldProperties = v; }

    public long   getTotalProperties()       { return totalProperties; }
    public void   setTotalProperties(long v) { totalProperties = v; }

    public long   getOpenTickets()       { return openTickets; }
    public void   setOpenTickets(long v) { openTickets = v; }

    public long   getTotalTickets()       { return totalTickets; }
    public void   setTotalTickets(long v) { totalTickets = v; }

    public double getConversionRate()       { return conversionRate; }
    public void   setConversionRate(double v){ conversionRate = v; }

    public List<Long> getMonthlyThisYear()           { return monthlyThisYear; }
    public void       setMonthlyThisYear(List<Long> v){ monthlyThisYear = v; }

    public List<Long> getMonthlyLastYear()           { return monthlyLastYear; }
    public void       setMonthlyLastYear(List<Long> v){ monthlyLastYear = v; }

    public List<HotProspect>   getHotProspects()             { return hotProspects; }
    public void                setHotProspects(List<HotProspect> v){ hotProspects = v; }

    public List<RecentTicket>  getRecentTickets()              { return recentTickets; }
    public void                setRecentTickets(List<RecentTicket> v){ recentTickets = v; }
}
