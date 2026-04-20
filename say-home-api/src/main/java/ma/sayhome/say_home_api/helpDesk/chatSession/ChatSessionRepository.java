package ma.sayhome.say_home_api.chatbot.chatSession;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession,Integer> {
}
