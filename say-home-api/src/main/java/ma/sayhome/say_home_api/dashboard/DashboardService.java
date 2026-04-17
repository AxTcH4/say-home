package ma.sayhome.say_home_api.dashboard;

public interface DashboardService {

    DashboardProfileResponse getProfile(Integer userId);

    DashboardProfileResponse updateProfile(Integer userId, DashboardProfileUpdateRequest request);

    DashboardSummaryResponse getSummary(Integer userId);
}
