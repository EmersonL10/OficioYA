package com.oficioya.backend.dto;

import jakarta.validation.constraints.*;

public record ContratacionRequest(

    @NotNull(message = "La cotización es obligatoria")
    @Positive(message = "La cotización debe tener un ID válido")
    Long cotizacionId

) {
}