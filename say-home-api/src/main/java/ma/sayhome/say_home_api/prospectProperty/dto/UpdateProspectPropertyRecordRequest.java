package ma.sayhome.say_home_api.prospectProperty.dto;

import ma.sayhome.say_home_api.shared.enums.ProspectPropertyStatus;

public class UpdateProspectPropertyRecordRequest {
    public ProspectPropertyStatus status;
    public Float finalPrice;
    public Float monthlyRent;
    public Float securityDeposit;
    public String leaseStartDate;
    public Integer leaseDurationMonths;
    public String notes;
}
