package ma.sayhome.say_home_api.helpDesk.dto;

public record TicketListItemResponse(
        Integer id,
        String title,
        String description,
        String status,
        Integer prospectId,
        String prospectName
) {
}
