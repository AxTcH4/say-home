package ma.sayhome.say_home_api.property;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import ma.sayhome.say_home_api.shared.enums.PropertyType;

@Converter(autoApply = false)
public class PropertyTypeConverter implements AttributeConverter<PropertyType, String> {

    @Override
    public String convertToDatabaseColumn(PropertyType attribute) {
        return attribute != null ? attribute.toStorageValue() : null;
    }

    @Override
    public PropertyType convertToEntityAttribute(String dbData) {
        return PropertyType.fromStorageValue(dbData);
    }
}
