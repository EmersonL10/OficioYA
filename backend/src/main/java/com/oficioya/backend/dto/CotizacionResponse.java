package com.oficioya.backend.dto;

import com.oficioya.backend.enums.EstadoCotizacion;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CotizacionResponse(

    Long id,
    Long solicitudId,
    String solicitudTitulo,
    Long profesionalId,
    String profesionalNombre,
    BigDecimal monto,
    String descripcion,
    int plazoDias,
    EstadoCotizacion estado,
    LocalDateTime fechaEnvio

) {
}