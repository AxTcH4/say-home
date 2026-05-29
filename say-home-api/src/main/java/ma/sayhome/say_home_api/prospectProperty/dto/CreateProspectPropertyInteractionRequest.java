package ma.sayhome.say_home_api.prospectProperty.dto;

import ma.sayhome.say_home_api.shared.enums.ProspectPropertyInteractionType;

public class CreateProspectPropertyInteractionRequest {
    public ProspectPropertyInteractionType type;
    public String comment;
}
