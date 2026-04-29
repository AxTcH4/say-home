package ma.sayhome.say_home_api.prospect.dto;

import java.util.List;

public record ProspectFiltersResponse(
        List<String> statuses,
        List<String> assignedAgents,
        List<String> sources
) {
}
