package com.oficioya.backend.controller;

import com.oficioya.backend.dto.*;
import com.oficioya.backend.service.ProfesionalService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ProfesionalController {

    private final ProfesionalService profesionalService;

    public ProfesionalController(
            ProfesionalService profesionalService) {

        this.profesionalService = profesionalService;
    }

    @GetMapping("/publico/profesionales")
    public List<ProfesionalResponse> listarDisponibles() {
        return profesionalService.listarDisponibles();
    }

    @GetMapping("/publico/profesionales/categoria/{categoriaId}")
    public List<ProfesionalResponse> buscarPorCategoria(
            @PathVariable Long categoriaId) {

        return profesionalService.buscarPorCategoria(categoriaId);
    }

    @PostMapping("/profesional/perfil")
    @ResponseStatus(HttpStatus.CREATED)
    public ProfesionalResponse registrar(
            Authentication authentication,
            @Valid @RequestBody ProfesionalRequest request) {

        return profesionalService.registrar(
                obtenerUsuarioId(authentication), request);
    }

    @GetMapping("/profesional/perfil")
    public ProfesionalResponse consultarPerfil(
            Authentication authentication) {

        return profesionalService.buscarPorUsuario(
                obtenerUsuarioId(authentication));
    }

    @PutMapping("/profesional/perfil")
    public ProfesionalResponse actualizar(
            Authentication authentication,
            @Valid @RequestBody ProfesionalRequest request) {

        return profesionalService.actualizar(
                obtenerUsuarioId(authentication), request);
    }

    @PatchMapping("/profesional/perfil/disponibilidad")
    public ProfesionalResponse cambiarDisponibilidad(
            Authentication authentication,
            @RequestParam boolean disponible) {

        return profesionalService.cambiarDisponibilidad(
                obtenerUsuarioId(authentication), disponible);
    }

    private Long obtenerUsuarioId(Authentication authentication) {
        return Long.valueOf(authentication.getName());
    }
}