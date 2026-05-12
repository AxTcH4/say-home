package ma.sayhome.say_home_api.prospectProperty.interaction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.sayhome.say_home_api.prospectProperty.ProspectPropertyRecord;
import ma.sayhome.say_home_api.shared.EntityBase;
import ma.sayhome.say_home_api.shared.enums.ProspectPropertyInteractionType;

@Data
@NoArgsConstructor
@Entity
@Table(name = "prospect_property_interactions")
public class ProspectPropertyInteraction extends EntityBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProspectPropertyInteractionType type;

    @Column(nullable = false, length = 2000)
    private String comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id", nullable = false)
    private ProspectPropertyRecord record;
}
