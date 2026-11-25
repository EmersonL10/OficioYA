package com.oficioya.backend.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record CotizacionRequest(

    @NotNull(message = "La solicitud es obligatoria")
    @Positive(message = "La solicitud debe tener un ID válido")
    Long solicitudId,

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01",
                message = "El monto debe ser mayor que cero")
    @Digits(integer = 8, fraction = 2)
    BigDecimal monto,

    @NotBlank(message = "La descripción es obligatoria")
    @Size(min = 10, max = 2000)
    String descripcion,

    @NotNull(message = "El plazo es obligatorio")
    @Min(value = 1, message = "El plazo mínimo es de un día")
    @Max(value = 365, message = "El plazo máximo es de 365 días")
    Integer plazoDias

) {
}