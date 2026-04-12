package ma.sayhome.say_home_api.shared.exceptions;

import ma.sayhome.say_home_api.shared.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import ma.sayhome.say_home_api.shared.exceptions.BadRequestException;
import ma.sayhome.say_home_api.shared.exceptions.ResourceNotFoundException;
import ma.sayhome.say_home_api.shared.exceptions.UnauthorizedException;
@RestControllerAdvice
public class GlobalHandler {
        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ApiResponse> handleNotFound(ResourceNotFoundException ex) {
            return ResponseEntity.status(404).body(ApiResponse.error("Resource Not Found", ex.getMessage()));
        }

        @ExceptionHandler(BadRequestException.class)
        public ResponseEntity<ApiResponse> handleBadRequest(BadRequestException ex) {
            return ResponseEntity.status(400).body(ApiResponse.error("Invalid Request", ex.getMessage()));
        }

        @ExceptionHandler(UnauthorizedException.class)
        public ResponseEntity<ApiResponse> handleBadRequest(UnauthorizedException ex ) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized Action", ex.getMessage()));
        }

        @ExceptionHandler(Exception.class) // catches anything you missed
        public ResponseEntity<ApiResponse> handleGeneric(Exception ex) {
            return ResponseEntity.status(500).body(ApiResponse.error("Internal Error", ex.getMessage()));
        }
    }

