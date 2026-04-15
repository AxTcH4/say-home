package ma.sayhome.say_home_api.automation;

import jakarta.persistence.*;
import ma.sayhome.say_home_api.shared.EntityBase;

@Entity
@Table(name = "automation_rules")
public class AutomationRule extends EntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String rule_condition;

    @Column(nullable = false)
    private String action;

    // getters + setters
}