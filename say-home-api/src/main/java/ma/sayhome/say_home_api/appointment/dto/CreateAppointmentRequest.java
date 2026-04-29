package ma.sayhome.say_home_api.appointment.dto;

public class CreateAppointmentRequest {
    public Integer prospectId;
    public Integer agentId;
    public Integer propertyId;
    public String date;
    public String time;
    public String meetingType;
    public String notes;
}
