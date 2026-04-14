package ma.sayhome.say_home_api.property;

public class PropertyDTO {
    private Integer id;
    private String main_pic;
    private String secteur;
    private String title;
    private Float price;
    private String surface;
    private String rooms;

    // no-arg constructor
    public PropertyDTO() {}

    public Integer getId() {
        return id;
    }
    public void setId(Integer id) {
        this.id = id;
    }
    public String getMain_pic() {
        return main_pic;
    }
    public void setMain_pic(String main_pic) {
        this.main_pic = main_pic;
    }
    public String getSecteur() {
        return secteur;
    }

    public void setSecteur(String secteur) {
        this.secteur = secteur;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public Float getPrice() {
        return price;
    }
    public void setPrice(Float price) {
        this.price = price;
    }
    public String getSurface() {
        return surface;
    }
    public void setSurface(String surface) {
        this.surface = surface;
    }
    public String getRooms() {
        return rooms;

    }
    public void setRooms(String rooms) {
        this.rooms = rooms;
    }

    // getters + setters
}