package ma.sayhome.say_home_api.wish.dto;

public record WantedPropertyFormResponse(
        String token,
        String prospectName,
        String propertyTitle,
        boolean submitted,
        String type,
        String secteur,
        Float minPrice,
        Float maxPrice,
        Integer minSurface,
        Integer maxSurface,
        Integer minRooms,
        Integer maxRooms,
        Integer minBathrooms,
        Integer maxBathrooms,
        Boolean climatisation,
        Boolean piscine,
        Boolean jardin,
        Boolean garage,
        Boolean securite,
        Boolean systemeDomotiqueComplet
) {
}
