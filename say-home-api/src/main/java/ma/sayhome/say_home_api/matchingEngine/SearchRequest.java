package ma.sayhome.say_home_api.matchingEngine;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class SearchRequest {

    @Size(max = 100, message = "Query too long")
    private String title;

    @Pattern(regexp = "^(villa|appartement|riad)?$", message = "Type Invalide")
    private String type;

    @Pattern(regexp = "^(gueliz|hivernage|medina)?$", message = "Secteur Invalide")
    private String secteur;

    @DecimalMin(value = "0.0", inclusive = true, message = "Min price cannot be negative")
    private Float minPrice;

    @DecimalMin(value = "0.0", inclusive = true,  message = "Max price cannot be negative")
    private Float maxPrice;

    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }

    public String getType() {
        return type;
    }
    public void setType(String type) {
        this.type = type;
    }

    public String getSecteur() {
        return secteur;
    }
    public void setSecteur(String secteur) {
        this.secteur = secteur;
    }

    public Float getMinPrice() {
        return minPrice;
    }
    public void setMinPrice(Float minPrice) {
        this.minPrice = minPrice;
    }

    public Float getMaxPrice() {
        return maxPrice;
    }
    public void setMaxPrice(Float maxPrice) {
        this.maxPrice = maxPrice;
    }

}
