package com.oficioya.backend.dto;

import com.oficioya.backend.enums.Rol;
import java.time.LocalDateTime;

public record UsuarioResponse(

    Long id,
    String nombres,
    String apellidos,
    String correo,
    String telefono,
    Rol rol,
    boolean activo,
    LocalDateTime fechaRegistro

) {
}