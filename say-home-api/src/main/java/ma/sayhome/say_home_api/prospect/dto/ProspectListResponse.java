package ma.sayhome.say_home_api.prospect.dto;

import java.util.List;

public record ProspectListResponse(
        List<ProspectListItemResponse> items,
        long total,
        int page,
        int pageSize,
        ProspectFiltersResponse filters
) {
}
