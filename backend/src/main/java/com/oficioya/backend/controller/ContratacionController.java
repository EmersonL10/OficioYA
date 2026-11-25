package com.oficioya.backend.controller;

import com.oficioya.backend.dto.*;
import com.oficioya.backend.service.ContratacionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ContratacionController {

    private final ContratacionService contratacionService;

    public ContratacionController(
            ContratacionService contratacionService) {

        this.contratacionService = contratacionService;
    }

    @PostMapping("/cliente/contrataciones")
    @ResponseStatus(HttpStatus.CREATED)
    public ContratacionResponse contratar(
            Authentication authentication,
            @Valid @RequestBody ContratacionRequest request) {

        return contratacionService.contratar(
                obtenerUsuarioId(authentication), request);
    }

    @GetMapping("/cliente/contrataciones")
    public List<ContratacionResponse> listarCliente(
            Authentication authentication) {

        return contratacionService.listarPorCliente(
                obtenerUsuarioId(authentication));
    }

    @GetMapping("/profesional/contrataciones")
    public List<ContratacionResponse> listarProfesional(
            Authentication authentication) {

        return contratacionService.listarPorProfesional(
                obtenerUsuarioId(authentication));
    }

    @PatchMapping("/profesional/contrataciones/{id}/iniciar")
    public ContratacionResponse iniciar(
            @PathVariable Long id,
            Authentication authentication) {

        return contratacionService.iniciar(
                id, obtenerUsuarioId(authentication));
    }

    @PatchMapping("/cliente/contrataciones/{id}/finalizar")
    public ContratacionResponse finalizar(
            @PathVariable Long id,
            Authentication authentication) {

        return contratacionService.finalizar(
                id, obtenerUsuarioId(authentication));
    }

    @PatchMapping("/cliente/contrataciones/{id}/cancelar")
    public ContratacionResponse cancelar(
            @PathVariable Long id,
            Authentication authentication) {

        return contratacionService.cancelar(
                id, obtenerUsuarioId(authentication));
    }

    private Long obtenerUsuarioId(Authentication authentication) {
        return Long.valueOf(authentication.getName());
    }
}