package ma.sayhome.say_home_api.shared.enums;

public enum PropertySecteur {
    GUELIZ,
    PALMERAIE,
    TARGA,
    MEDINA,
    ROUTE_D_OURIKA,
    AGDAL,
    HIVERNAGE,
    MABROUKA;

    public String toStorageValue() {
        return name().toLowerCase().replace("_", "-");
    }

    public static PropertySecteur fromStorageValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String normalized = value.trim()
                .replace("-", "_")
                .replace(" ", "_")
                .replace("'", "")
                .toUpperCase();

        return PropertySecteur.valueOf(normalized);
    }
}
