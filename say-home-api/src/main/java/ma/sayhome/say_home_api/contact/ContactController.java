package ma.sayhome.say_home_api.contact;

import ma.sayhome.say_home_api.shared.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ContactResponse>> sendMessage(@RequestBody ContactRequest request) {
        ContactResponse response = contactService.sendContact(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
