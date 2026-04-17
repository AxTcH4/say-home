package ma.sayhome.say_home_api.matchingEngine;

import lombok.AllArgsConstructor;
import lombok.Data;
import ma.sayhome.say_home_api.property.dto.PropertyDTO;

@Data
public class SearchEngineResult {
    private PropertyDTO property;
    private Float score; // the fake percentage for now

    public SearchEngineResult() {} // ← Jackson needs this

    public SearchEngineResult(PropertyDTO property, Float score) {
        this.property = property;
        this.score = score;
    }

    public PropertyDTO getProperty() { return property; }
    public Float getScore() { return score; }

    public void setProperty(PropertyDTO property) { this.property = property; }
    public void setScore(Float score) { this.score = score; }
    // getters

}
