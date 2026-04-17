package ma.sayhome.say_home_api.dashboard;

public class DashboardProfileResponse {

    private Integer id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;

    public DashboardProfileResponse(Integer id, String firstName, String lastName, String email, String phone) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
    }

    public Integer getId() {
        return id;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }
}
