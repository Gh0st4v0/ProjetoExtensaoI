package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.services.InventarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/alerts")
@RequiredArgsConstructor
public class AlertsController {

    private final InventarioService inventarioService;

    @Value("${app.alerts.expiryDays:7}")
    private int defaultExpiryDays;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAlerts(
            @RequestParam(value = "expiryDays", required = false) Integer expiryDays
    ) {
        int days = expiryDays != null ? expiryDays : defaultExpiryDays;
        Map<String, Object> alerts = inventarioService.getAlerts(days);
        return ResponseEntity.ok(alerts);
    }
}
