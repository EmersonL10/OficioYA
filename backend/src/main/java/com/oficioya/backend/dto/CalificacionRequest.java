package com.oficioya.backend.dto;

import jakarta.validation.constraints.*;

public record CalificacionRequest(

    @NotNull(message = "La contratación es obligatoria")
    @Positive(message = "La contratación debe tener un ID válido")
    Long contratacionId,

    @NotNull(message = "La puntuación es obligatoria")
    @Min(value = 1, message = "La puntuación mínima es 1")
    @Max(value = 5, message = "La puntuación máxima es 5")
    Integer puntuacion,

    @Size(max = 1000,
          message = "El comentario no debe superar los 1000 caracteres")
    String comentario

) {
}