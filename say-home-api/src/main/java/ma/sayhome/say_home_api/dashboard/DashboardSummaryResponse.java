package ma.sayhome.say_home_api.dashboard;

public class DashboardSummaryResponse {

    private long boughtProperties;
    private long rentedProperties;
    private long negotiatingProperties;
    private long ticketsCount;

    public DashboardSummaryResponse(long boughtProperties, long rentedProperties, long negotiatingProperties, long ticketsCount) {
        this.boughtProperties = boughtProperties;
        this.rentedProperties = rentedProperties;
        this.negotiatingProperties = negotiatingProperties;
        this.ticketsCount = ticketsCount;
    }

    public long getBoughtProperties() {
        return boughtProperties;
    }

    public long getRentedProperties() {
        return rentedProperties;
    }

    public long getNegotiatingProperties() {
        return negotiatingProperties;
    }

    public long getTicketsCount() {
        return ticketsCount;
    }
}