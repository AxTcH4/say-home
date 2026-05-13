package ma.sayhome.say_home_api.helpDesk.chatSession;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import ma.sayhome.say_home_api.helpDesk.chatMessage.ChatMessage;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.shared.EntityBase;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@ToString(exclude = {"messages", "propsect"})
@Table(name = "chat_sessions")
public class ChatSession extends EntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "prospect_id", nullable = false)
    private Prospect prospect;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column
    boolean isOngoing;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<ChatMessage> messages = new ArrayList<>();

    public ChatSession(Prospect prospect) {
        this.prospect = prospect;
        expiresAt = LocalDateTime.now().plusMinutes(30);

        isOngoing=true;
    }

}