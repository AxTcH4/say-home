package ma.sayhome.say_home_api.matchingEngine;

import ma.sayhome.say_home_api.property.Property;
import ma.sayhome.say_home_api.property.PropertyDTO;

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
