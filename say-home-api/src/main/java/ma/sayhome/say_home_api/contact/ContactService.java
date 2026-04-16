package ma.sayhome.say_home_api.contact;

public interface ContactService {
    ContactResponse sendContact(ContactRequest request);
}