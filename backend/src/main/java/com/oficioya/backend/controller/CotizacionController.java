package com.oficioya.backend.controller;

import com.oficioya.backend.dto.*;
import com.oficioya.backend.service.CotizacionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class CotizacionController {

    private final CotizacionService cotizacionService;

    public CotizacionController(
            CotizacionService cotizacionService) {

        this.cotizacionService = cotizacionService;
    }

    @PostMapping("/profesional/cotizaciones")
    @ResponseStatus(HttpStatus.CREATED)
    public CotizacionResponse registrar(
            Authentication authentication,
            @Valid @RequestBody CotizacionRequest request) {

        return cotizacionService.registrar(
                obtenerUsuarioId(authentication), request);
    }

    @GetMapping("/profesional/cotizaciones")
    public List<CotizacionResponse> listarEnviadas(
            Authentication authentication) {

        return cotizacionService.listarPorProfesional(
                obtenerUsuarioId(authentication));
    }

    @GetMapping("/cliente/solicitudes/{id}/cotizaciones")
    public List<CotizacionResponse> listarRecibidas(
            @PathVariable Long id,
            Authentication authentication) {

        return cotizacionService.listarPorSolicitud(
                id, obtenerUsuarioId(authentication));
    }

    private Long obtenerUsuarioId(Authentication authentication) {
        return Long.valueOf(authentication.getName());
    }
}