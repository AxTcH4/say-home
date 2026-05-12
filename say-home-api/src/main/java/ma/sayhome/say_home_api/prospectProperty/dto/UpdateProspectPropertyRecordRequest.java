package ma.sayhome.say_home_api.prospectProperty.dto;

import ma.sayhome.say_home_api.shared.enums.ProspectPropertyStatus;

public class UpdateProspectPropertyRecordRequest {
    public ProspectPropertyStatus status;
    public Float finalPrice;
    public String notes;
}
