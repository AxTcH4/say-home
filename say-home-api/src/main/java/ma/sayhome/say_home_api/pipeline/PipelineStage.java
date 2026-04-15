package ma.sayhome.say_home_api.pipeline;

import jakarta.persistence.*;
import ma.sayhome.say_home_api.prospect.Prospect;
import ma.sayhome.say_home_api.shared.EntityBase;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pipeline_stages")
public class PipelineStage extends EntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "stage", cascade = CascadeType.ALL)
    private List<Prospect> prospects = new ArrayList<>();

    // getters + setters
}