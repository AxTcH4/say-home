package ma.sayhome.say_home_api.shared;

import org.springframework.http.ResponseEntity;

public abstract class ControllerBase {

    protected <T> ResponseEntity<ApiResponse<T>> ok(T data) {
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    protected <T> ResponseEntity<ApiResponse<T>> created(T data) {
        return ResponseEntity.status(201).body(ApiResponse.ok(data));
    }

    protected ResponseEntity<ApiResponse<Void>> noContent() {
        return ResponseEntity.status(204).body(ApiResponse.ok("Deleted"));
    }
}
