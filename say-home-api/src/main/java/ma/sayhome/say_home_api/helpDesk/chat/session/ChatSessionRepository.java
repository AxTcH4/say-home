package ma.sayhome.say_home_api.helpDesk.chat.session;

import ma.sayhome.say_home_api.helpDesk.chat.dto.ChatSessionDTO;
import ma.sayhome.say_home_api.helpDesk.chat.message.ChatMessage;
import ma.sayhome.say_home_api.prospect.Prospect;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession,Integer> {
    ChatSession findByProspect(Prospect prospect);

    List<ChatSessionDTO> findChatSessionByProspect(Prospect prospect);

    List<ChatSession> findAllByProspect(Prospect prospect);

    ChatSession findByMessagesExists(List<ChatMessage> messages);

//    ChatSession findByMessagesIsLikeIgnoreCase(List<ChatMessage> messages);
    @Query("SELECT DISTINCT cs FROM ChatSession cs JOIN cs.messages m WHERE LOWER(m.content) LIKE LOWER(CONCAT('%', :content, '%'))")
    ChatSession findByMessageContent(@Param("content") String content);

    @Query("SELECT s FROM ChatSession s WHERE s.prospect = :prospect AND s.isOngoing = true AND s.expiresAt > :now")
    Optional<ChatSession> findActiveSession(@Param("prospect") Prospect prospect, @Param("now") LocalDateTime now);

}
