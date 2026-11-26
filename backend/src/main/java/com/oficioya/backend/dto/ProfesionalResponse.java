package com.oficioya.backend.dto;

public record ProfesionalResponse(

    Long id,
    Long usuarioId,
    String nombres,
    String apellidos,
    Long categoriaId,
    String categoriaNombre,
    String descripcion,
    int experienciaAnios,
    boolean disponible

) {
}