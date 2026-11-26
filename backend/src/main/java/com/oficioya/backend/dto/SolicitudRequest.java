package com.oficioya.backend.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record SolicitudRequest(

    @NotNull(message = "La categoría es obligatoria")
    @Positive(message = "La categoría debe tener un ID válido")
    Long categoriaId,

    @NotBlank(message = "El título es obligatorio")
    @Size(min = 5, max = 150)
    String titulo,

    @NotBlank(message = "La descripción es obligatoria")
    @Size(min = 10, max = 2000)
    String descripcion,

    @NotBlank(message = "La dirección es obligatoria")
    @Size(max = 255)
    String direccion,

    @NotNull(message = "El presupuesto es obligatorio")
    @DecimalMin(value = "0.01",
                message = "El presupuesto debe ser mayor que cero")
    @Digits(integer = 8, fraction = 2)
    BigDecimal presupuesto

) {
}