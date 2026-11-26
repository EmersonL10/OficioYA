package com.oficioya.backend.dto;

import com.oficioya.backend.enums.EstadoSolicitud;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SolicitudResponse(

    Long id,
    Long clienteId,
    String clienteNombre,
    Long categoriaId,
    String categoriaNombre,
    String titulo,
    String descripcion,
    String direccion,
    BigDecimal presupuesto,
    EstadoSolicitud estado,
    LocalDateTime fechaCreacion

) {
}