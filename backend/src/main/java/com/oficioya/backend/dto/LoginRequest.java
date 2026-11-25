package com.oficioya.backend.dto;

import jakarta.validation.constraints.*;

public record LoginRequest(

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no es válido")
    @Size(max = 150)
    String correo,

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(max = 72)
    String contrasena

) {
}