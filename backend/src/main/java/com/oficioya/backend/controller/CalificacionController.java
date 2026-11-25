package com.oficioya.backend.controller;

import com.oficioya.backend.dto.*;
import com.oficioya.backend.service.CalificacionService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class CalificacionController {

    private final CalificacionService calificacionService;

    public CalificacionController(
            CalificacionService calificacionService) {

        this.calificacionService = calificacionService;
    }

    @PostMapping("/cliente/calificaciones")
    @ResponseStatus(HttpStatus.CREATED)
    public CalificacionResponse registrar(
            Authentication authentication,
            @Valid @RequestBody CalificacionRequest request) {

        return calificacionService.registrar(
                obtenerUsuarioId(authentication), request);
    }

    @GetMapping("/publico/profesionales/{id}/calificaciones")
    public List<CalificacionResponse> listar(
            @PathVariable Long id) {

        return calificacionService.listarPorProfesional(id);
    }

    @GetMapping("/publico/profesionales/{id}/promedio")
    public Map<String, Double> promedio(
            @PathVariable Long id) {

        return Map.of(
                "promedio",
                calificacionService.calcularPromedio(id));
    }

    private Long obtenerUsuarioId(Authentication authentication) {
        return Long.valueOf(authentication.getName());
    }
}