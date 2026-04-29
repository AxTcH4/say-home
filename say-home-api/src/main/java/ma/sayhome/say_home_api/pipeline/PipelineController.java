package ma.sayhome.say_home_api.pipeline;

import ma.sayhome.say_home_api.pipeline.dto.UpdatePipelineStatusRequest;
import ma.sayhome.say_home_api.shared.ControllerBase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pipeline")
public class PipelineController extends ControllerBase {
    private final PipelineServiceImp pipelineService;

    public PipelineController(PipelineServiceImp pipelineService) {
        this.pipelineService = pipelineService;
    }

    @GetMapping
    public ResponseEntity<?> getBoard(
            @RequestParam(required = false) String assignedAgent,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String source
    ) {
        return ok(pipelineService.getBoard(assignedAgent, city, source));
    }

    @PatchMapping("/prospects/{id}/status")
    public ResponseEntity<?> updateProspectStatus(
            @PathVariable Integer id,
            @RequestBody UpdatePipelineStatusRequest request
    ) {
        return ok(pipelineService.updateProspectStatus(id, request.status));
    }
}
