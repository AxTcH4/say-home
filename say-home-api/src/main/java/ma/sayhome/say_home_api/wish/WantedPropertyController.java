package ma.sayhome.say_home_api.wish;

import ma.sayhome.say_home_api.shared.ControllerBase;
import ma.sayhome.say_home_api.wish.dto.ProspectWishFormResponse;
import ma.sayhome.say_home_api.wish.dto.SubmitProspectWishRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wishes")
public class WantedPropertyController extends ControllerBase {
    private final WantedPropertyService wantedPropertyService;

    public WantedPropertyController(WantedPropertyService wantedPropertyService) {
        this.wantedPropertyService = wantedPropertyService;
    }

    @GetMapping("/{token}")
    public ResponseEntity<?> getWishForm(@PathVariable String token) {
        ProspectWishFormResponse response = wantedPropertyService.getPublicForm(token);
        return ok(response);
    }

    @PostMapping("/{token}")
    public ResponseEntity<?> submitWish(
            @PathVariable String token,
            @RequestBody SubmitProspectWishRequest request
    ) {
        ProspectWishFormResponse response = wantedPropertyService.submit(token, request);
        return ok(response);
    }
}
