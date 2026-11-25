package com.oficioya.backend.dto;

import jakarta.validation.constraints.*;

public record RegistroRequest(

    @NotBlank(message = "Los nombres son obligatorios")
    @Size(max = 100)
    String nombres,

    @NotBlank(message = "Los apellidos son obligatorios")
    @Size(max = 100)
    String apellidos,

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no es válido")
    @Size(max = 150)
    String correo,

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, max = 72,
          message = "La contraseña debe tener entre 8 y 72 caracteres")
    String contrasena,

    @Pattern(
        regexp = "^9[0-9]{8}$",
        message = "El teléfono debe tener 9 dígitos y comenzar con 9"
    )
    @NotBlank(message = "El teléfono es obligatorio")
    String telefono

) {
}