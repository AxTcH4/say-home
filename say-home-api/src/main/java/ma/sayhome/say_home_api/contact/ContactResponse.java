package ma.sayhome.say_home_api.contact;

public class ContactResponse {

    private String message;

    public ContactResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}