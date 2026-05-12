package ma.sayhome.say_home_api.prospectProperty.document;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import ma.sayhome.say_home_api.prospectProperty.ProspectPropertyRecord;
import ma.sayhome.say_home_api.shared.EntityBase;
import ma.sayhome.say_home_api.shared.enums.ProspectPropertyDocumentType;

@Data
@NoArgsConstructor
@Entity
@Table(name = "prospect_property_documents")
@ToString(exclude = "record")
public class ProspectPropertyDocument extends EntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String url;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProspectPropertyDocumentType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id", nullable = false)
    private ProspectPropertyRecord record;
}
