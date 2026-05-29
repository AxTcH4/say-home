package ma.sayhome.say_home_api.property;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import ma.sayhome.say_home_api.shared.enums.PropertySecteur;

@Converter(autoApply = false)
public class PropertySecteurConverter implements AttributeConverter<PropertySecteur, String> {

    @Override
    public String convertToDatabaseColumn(PropertySecteur attribute) {
        return attribute != null ? attribute.toStorageValue() : null;
    }

    @Override
    public PropertySecteur convertToEntityAttribute(String dbData) {
        return PropertySecteur.fromStorageValue(dbData);
    }
}
