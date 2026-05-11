package ma.sayhome.say_home_api.dashboard;

import ma.sayhome.say_home_api.dashboard.dto.DashboardProfileResponse;
import ma.sayhome.say_home_api.dashboard.dto.DashboardProfileUpdateRequest;
import ma.sayhome.say_home_api.dashboard.dto.DashboardStatsResponse;
import ma.sayhome.say_home_api.dashboard.dto.DashboardSummaryResponse;

public interface DashboardService {

    DashboardProfileResponse getProfile(Integer userId);

    DashboardProfileResponse updateProfile(Integer userId, DashboardProfileUpdateRequest request);

    DashboardSummaryResponse getSummary(Integer userId);

    DashboardStatsResponse getStats();
}
