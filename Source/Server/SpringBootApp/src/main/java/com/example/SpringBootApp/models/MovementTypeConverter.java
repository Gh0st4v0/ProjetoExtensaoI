package com.example.SpringBootApp.models;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class MovementTypeConverter implements AttributeConverter<MovementType, String> {

    @Override
    public String convertToDatabaseColumn(MovementType attribute) {
        return attribute == null ? null : attribute.name();
    }

    @Override
    public MovementType convertToEntityAttribute(String dbData) {
        return dbData == null ? null : MovementType.valueOf(dbData);
    }
}
