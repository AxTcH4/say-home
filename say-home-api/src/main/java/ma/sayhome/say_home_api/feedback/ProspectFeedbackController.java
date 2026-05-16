package ma.sayhome.say_home_api.feedback;

import ma.sayhome.say_home_api.feedback.dto.ProspectFeedbackFormResponse;
import ma.sayhome.say_home_api.feedback.dto.SubmitProspectFeedbackRequest;
import ma.sayhome.say_home_api.shared.ControllerBase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feedback")
public class ProspectFeedbackController extends ControllerBase {
    private final ProspectFeedbackService feedbackService;

    public ProspectFeedbackController(ProspectFeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @GetMapping("/{token}")
    public ResponseEntity<?> getForm(@PathVariable String token) {
        ProspectFeedbackFormResponse response = feedbackService.getPublicForm(token);
        return ok(response);
    }

    @PostMapping("/{token}")
    public ResponseEntity<?> submit(
            @PathVariable String token,
            @RequestBody SubmitProspectFeedbackRequest request
    ) {
        ProspectFeedbackFormResponse response = feedbackService.submit(token, request);
        return ok(response);
    }
}
