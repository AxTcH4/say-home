package ma.sayhome.say_home_api.helpDesk;

import jakarta.validation.Valid;
import ma.sayhome.say_home_api.auth.User;
import ma.sayhome.say_home_api.helpDesk.dto.ChatMessageRequest;
import ma.sayhome.say_home_api.helpDesk.dto.ChatSessionDTO;

import ma.sayhome.say_home_api.shared.ApiResponse;
import ma.sayhome.say_home_api.shared.ControllerBase;
import ma.sayhome.say_home_api.shared.exceptions.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/helpdesk")
@CrossOrigin(origins = "http://localhost:3000")
public class HelpDeskController extends ControllerBase {
    @Autowired
    private HelpDeskServiceImp helpDeskService;


    //order food
    @PostMapping("/new")
    public ResponseEntity<ApiResponse<Boolean>> create(@Valid @RequestBody ChatMessageRequest messageRequest) {
        System.out.println("Hit the endpoint!!");

        User authenticatedUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (authenticatedUser == null) {
            throw new UnauthorizedException("User is not logged in");
        }
        System.out.println("user is authenticated");

        System.out.println("Request approved. forwarding to service...");
        boolean isSent = helpDeskService.handleSendingMessage(authenticatedUser, messageRequest);

        return ok(isSent);
    }

    //get sessions by userId
    @GetMapping("/sessions/{userId}")
    public ResponseEntity<ApiResponse<List<ChatSessionDTO>>>getChatsByUserId(@PathVariable("userId") Integer userId) {

        List<ChatSessionDTO> results = helpDeskService.getSessionsByUserId(userId);

        return ok(results);
    }

    //get all sessions
    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<ChatSessionDTO>>>getAllChats() {
        List<ChatSessionDTO> results = helpDeskService.getAllSessions();

        return ok(results);
    }

    //get sessions by chat by user Name
    @GetMapping("/sessions/user/{userName}")
    public ResponseEntity<ApiResponse<List<ChatSessionDTO>>>getChatsByUserFullName(@PathVariable("userName") String userName) {

        List<ChatSessionDTO> results = helpDeskService.getSessionsByUserFullName(userName);

        return ok(results);
    }

    //get session by a message
    @GetMapping("/sessions/search")
    public ResponseEntity<ApiResponse<ChatSessionDTO>>getChatByMessageContent(@RequestParam("messageContent") String messageContent) {
        ChatSessionDTO result = helpDeskService.getSessionByMessageContent(messageContent);
        return ok(result);
    }

    //delete session
    @DeleteMapping("/sessions/delete/{sessionId}")
    public ResponseEntity<ApiResponse<Boolean>> deleteSession (@PathVariable("sessionId") Integer sessionId) {
        boolean isDeleted = helpDeskService.deleteById(sessionId);
        return ok(isDeleted);
    }



}