package ma.sayhome.say_home_api.chatbot.chatMessage;
import jakarta.persistence.*;
import ma.sayhome.say_home_api.chatbot.chatSession.ChatSession;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.shared.EntityBase;

import java.util.ArrayList;

@Entity
@Table(name = "chat_messages")
public class ChatMessage extends EntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private String sender; // "agent" or "prospect"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ChatSession session;

    // getters + setters
}