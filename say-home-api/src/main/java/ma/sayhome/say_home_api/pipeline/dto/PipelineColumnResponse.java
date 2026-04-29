package ma.sayhome.say_home_api.pipeline.dto;

import java.util.List;

public record PipelineColumnResponse(
        String key,
        String title,
        Integer count,
        String color,
        List<PipelineCardResponse> prospects
) {
}
