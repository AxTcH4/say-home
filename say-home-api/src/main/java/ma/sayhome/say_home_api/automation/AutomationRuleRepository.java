package ma.sayhome.say_home_api.automation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AutomationRuleRepository extends JpaRepository <AutomationRule,Integer> {
}
