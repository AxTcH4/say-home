package ma.sayhome.say_home_api.helpDesk.chat.message;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends JpaRepository <ChatMessage,Integer> {


}
