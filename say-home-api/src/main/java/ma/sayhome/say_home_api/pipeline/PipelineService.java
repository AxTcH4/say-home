package ma.sayhome.say_home_api.pipeline;

import ma.sayhome.say_home_api.pipeline.dto.PipelineBoardResponse;
import ma.sayhome.say_home_api.shared.ServiceBase;

public interface PipelineService extends ServiceBase<PipelineStage, Integer> {
    PipelineBoardResponse getBoard(String assignedAgent, String city, String source);
    PipelineBoardResponse updateProspectStatus(Integer prospectId, String status);
}
