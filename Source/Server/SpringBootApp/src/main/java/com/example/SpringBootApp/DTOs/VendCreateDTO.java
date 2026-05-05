package com.example.SpringBootApp.DTOs;

import com.example.SpringBootApp.models.PaymentMethod;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;


import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendCreateDTO {

    private LocalDate saleDate;



    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private Boolean hasDiscount;

    @NotNull(message = "Usuario ID is required")
    private Long userId;

    private Long clienteId;

    @NotEmpty(message = "Items list cannot be empty")
    private List<@Valid VendItemDTO> items;
}

