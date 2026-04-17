package ma.sayhome.say_home_api.auth.dto;

public class ResetPasswordRequest {
    public String token;
    public String password;       // sent by frontend
    public String newPassword;    // alias
    public String confirmPassword;

    public String getEffectivePassword() {
        return password != null ? password : newPassword;
    }
}