package com.oficioya.backend.dto;

import jakarta.validation.constraints.*;

public record CategoriaRequest(

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, max = 100,
          message = "El nombre debe tener entre 3 y 100 caracteres")
    String nombre,

    @Size(max = 500,
          message = "La descripción no debe superar los 500 caracteres")
    String descripcion

) {
}