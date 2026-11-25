package com.oficioya.backend.dto;

import java.time.LocalDateTime;

public record CalificacionResponse(

    Long id,
    Long contratacionId,
    Long profesionalId,
    String profesionalNombre,
    String clienteNombre,
    int puntuacion,
    String comentario,
    LocalDateTime fechaCalificacion

) {
}