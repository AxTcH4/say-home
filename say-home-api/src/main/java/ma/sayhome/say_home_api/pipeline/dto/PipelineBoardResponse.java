package ma.sayhome.say_home_api.pipeline.dto;

import java.util.List;

public record PipelineBoardResponse(
        List<PipelineColumnResponse> columns,
        PipelineFiltersResponse filters,
        String lastUpdated
) {
}
