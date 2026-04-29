package ma.sayhome.say_home_api.pipeline.dto;

import java.util.List;

public record PipelineFiltersResponse(
        List<String> assignedAgents,
        List<String> cities,
        List<String> sources
) {
}
