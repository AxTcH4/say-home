package ma.sayhome.say_home_api.shared.enums;

public enum PropertyType {
    RIAD,
    VILLA,
    APPARTEMENT,
    STUDIO;

    public String toStorageValue() {
        return name().toLowerCase();
    }

    public static PropertyType fromStorageValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String normalized = value.trim()
                .replace("-", "_")
                .replace(" ", "_")
                .toUpperCase();

        if ("APAPRTEMENT".equals(normalized)) {
            normalized = "APPARTEMENT";
        }

        return PropertyType.valueOf(normalized);
    }
}
