package ma.sayhome.say_home_api.chatbot;

import ma.sayhome.say_home_api.shared.ControllerBase;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/helpdesk")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatbotController extends ControllerBase {


}