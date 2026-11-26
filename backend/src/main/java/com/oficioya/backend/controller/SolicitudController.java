package com.oficioya.backend.controller;

import com.oficioya.backend.dto.*;
import com.oficioya.backend.service.SolicitudService;
import com.oficioya.backend.service.ProfesionalService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class SolicitudController {

    private final SolicitudService solicitudService;
    private final ProfesionalService profesionalService;

    public SolicitudController(
            SolicitudService solicitudService,
            ProfesionalService profesionalService) {

        this.solicitudService = solicitudService;
        this.profesionalService = profesionalService;
    }

    @PostMapping("/cliente/solicitudes")
    @ResponseStatus(HttpStatus.CREATED)
    public SolicitudResponse registrar(
            Authentication authentication,
            @Valid @RequestBody SolicitudRequest request) {

        return solicitudService.registrar(
                obtenerUsuarioId(authentication), request);
    }

    @GetMapping("/cliente/solicitudes")
    public List<SolicitudResponse> listar(
            Authentication authentication) {

        return solicitudService.listarPorCliente(
                obtenerUsuarioId(authentication));
    }

    @GetMapping("/cliente/solicitudes/{id}")
    public SolicitudResponse buscar(
            @PathVariable Long id,
            Authentication authentication) {

        return solicitudService.buscarPorId(
                id, obtenerUsuarioId(authentication));
    }

    @PutMapping("/cliente/solicitudes/{id}")
    public SolicitudResponse actualizar(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody SolicitudRequest request) {

        return solicitudService.actualizar(
                id, obtenerUsuarioId(authentication), request);
    }

    @DeleteMapping("/cliente/solicitudes/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelar(
            @PathVariable Long id,
            Authentication authentication) {

        solicitudService.cancelar(
                id, obtenerUsuarioId(authentication));
    }

    @GetMapping("/profesional/solicitudes")
    public List<SolicitudResponse> listarDisponibles(
            Authentication authentication) {

        ProfesionalResponse profesional =
                profesionalService.buscarPorUsuario(
                        obtenerUsuarioId(authentication));

        return solicitudService.listarAbiertasPorCategoria(
                profesional.categoriaId());
    }

    private Long obtenerUsuarioId(Authentication authentication) {
        return Long.valueOf(authentication.getName());
    }
}