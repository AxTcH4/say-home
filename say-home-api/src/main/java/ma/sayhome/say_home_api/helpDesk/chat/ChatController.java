package ma.sayhome.say_home_api.helpDesk.chat;

import jakarta.validation.Valid;
import ma.sayhome.say_home_api.helpDesk.chat.dto.ChatMessageRequest;
import ma.sayhome.say_home_api.helpDesk.chat.dto.ChatSessionDTO;
import ma.sayhome.say_home_api.helpDesk.chat.dto.MessageResponse;
import ma.sayhome.say_home_api.shared.ApiResponse;
import ma.sayhome.say_home_api.shared.ControllerBase;
import ma.sayhome.say_home_api.shared.exceptions.UnauthorizedException;
import ma.sayhome.say_home_api.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/helpdesk")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ChatController extends ControllerBase {
    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/new")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<MessageResponse>> create(@Valid @RequestBody ChatMessageRequest messageRequest) {
        User authenticatedUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (authenticatedUser == null) {
            throw new UnauthorizedException("User is not logged in");
        }
        return ok(chatService.handleSendingMessage(authenticatedUser, messageRequest));
    }

    @GetMapping("/sessions/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN, AGENT, CLIENT')")
    public ResponseEntity<ApiResponse<List<ChatSessionDTO>>> getChatsByUserId(@PathVariable Integer userId) {
        return ok(chatService.getSessionsByUserId(userId));
    }

    @GetMapping("sessions/active")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<ChatSessionDTO>> getActiveSessionsByProspectId() {
        User authenticatedUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (authenticatedUser == null) {
            throw new UnauthorizedException("User is not logged in");
        }
        return ok(chatService.getActiveSessionsByProspectId(authenticatedUser));
    }

    @GetMapping("/sessions")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<List<ChatSessionDTO>>> getAllChats() {
        return ok(chatService.getAllSessions());
    }

    @GetMapping("/sessions/user/{userName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<List<ChatSessionDTO>>> getChatsByUserFullName(@PathVariable String userName) {
        return ok(chatService.getSessionsByUserFullName(userName));
    }

    @GetMapping("/sessions/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<ChatSessionDTO>> getChatByMessageContent(@RequestParam String messageContent) {
        return ok(chatService.getSessionByMessageContent(messageContent));
    }

    @DeleteMapping("/sessions/delete/{sessionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<Boolean>> deleteSession(@PathVariable Integer sessionId) {
        return ok(chatService.deleteById(sessionId));
    }
}
