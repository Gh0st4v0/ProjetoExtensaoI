package com.example.SpringBootApp.models;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class PaymentMethodConverter implements AttributeConverter<PaymentMethod, String> {

    @Override
    public String convertToDatabaseColumn(PaymentMethod attribute) {
        return attribute == null ? null : attribute.name();
    }

    @Override
    public PaymentMethod convertToEntityAttribute(String dbData) {
        return dbData == null ? null : PaymentMethod.valueOf(dbData);
    }
}
