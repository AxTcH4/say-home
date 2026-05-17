package ma.sayhome.say_home_api.prospectProperty;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import ma.sayhome.say_home_api.property.Property;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.prospectProperty.document.ProspectPropertyDocument;
import ma.sayhome.say_home_api.prospectProperty.interaction.ProspectPropertyInteraction;
import ma.sayhome.say_home_api.shared.EntityBase;
import ma.sayhome.say_home_api.shared.enums.ProspectPropertyStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@Entity
@Table(
        name = "prospect_property_records",
        uniqueConstraints = @UniqueConstraint(columnNames = {"prospect_id", "property_id"})
)
@ToString(exclude = {"prospect", "property", "documents", "interactions"})
public class ProspectPropertyRecord extends EntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prospect_id", nullable = false)
    private Prospect prospect;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProspectPropertyStatus status;

    private Float finalPrice;

    @Column(name = "monthly_rent")
    private Float monthlyRent;

    @Column(name = "security_deposit")
    private Float securityDeposit;

    @Column(name = "lease_start_date")
    private LocalDateTime leaseStartDate;

    @Column(name = "lease_duration_months")
    private Integer leaseDurationMonths;

    @Column(length = 2000)
    private String notes;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "record", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProspectPropertyDocument> documents = new ArrayList<>();

    @OneToMany(mappedBy = "record", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProspectPropertyInteraction> interactions = new ArrayList<>();

    @PrePersist
    public void onCreate() {
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
