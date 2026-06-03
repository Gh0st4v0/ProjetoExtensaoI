package com.example.SpringBootApp.DTOs;

import com.example.SpringBootApp.models.DescarteType;
import lombok.Data;

import java.time.LocalDate;

@Data
public class DescarteUpdateDTO {
    private LocalDate date;
    private DescarteType type;
}
