package ma.sayhome.say_home_api.auth;

import ma.sayhome.say_home_api.auth.dto.AdminUserRequest;
import ma.sayhome.say_home_api.shared.ControllerBase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController extends ControllerBase {
    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public ResponseEntity<?> getUsers() {
        return ok(adminUserService.getUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Integer id) {
        return ok(adminUserService.getUserById(id));
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody AdminUserRequest request) {
        return created(adminUserService.createUser(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @RequestBody AdminUserRequest request) {
        return ok(adminUserService.updateUser(id, request));
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<?> toggleUser(@PathVariable Integer id) {
        return ok(adminUserService.toggleUserActive(id));
    }
}
