package com.oficioya.backend.dto;

import com.oficioya.backend.enums.EstadoContratacion;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ContratacionResponse(

    Long id,
    Long cotizacionId,
    Long solicitudId,
    String solicitudTitulo,
    Long clienteId,
    String clienteNombre,
    Long profesionalId,
    String profesionalNombre,
    BigDecimal monto,
    EstadoContratacion estado,
    LocalDateTime fechaContratacion,
    LocalDateTime fechaInicio,
    LocalDateTime fechaFinalizacion

) {
}