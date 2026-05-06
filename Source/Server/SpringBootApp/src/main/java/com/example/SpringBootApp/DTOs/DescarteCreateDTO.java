package com.example.SpringBootApp.DTOs;

import com.example.SpringBootApp.models.DescarteType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DescarteCreateDTO {
    private LocalDate date;

    @NotNull(message = "Type is required")
    private DescarteType type;

    @NotNull(message = "Items are required")
    @Valid
    private List<DescarteItemDTO> items;
}
