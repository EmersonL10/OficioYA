package com.oficioya.backend.dto;

import jakarta.validation.constraints.*;

public record ProfesionalRequest(

    @NotNull(message = "La categoría es obligatoria")
    @Positive(message = "La categoría debe tener un ID válido")
    Long categoriaId,

    @NotBlank(message = "La descripción es obligatoria")
    @Size(min = 10, max = 1000,
          message = "La descripción debe tener entre 10 y 1000 caracteres")
    String descripcion,

    @NotNull(message = "La experiencia es obligatoria")
    @Min(value = 0, message = "La experiencia no puede ser negativa")
    @Max(value = 70, message = "La experiencia no puede superar los 70 años")
    Integer experienciaAnios

) {
}