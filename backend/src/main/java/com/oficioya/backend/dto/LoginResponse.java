package com.oficioya.backend.dto;

public record LoginResponse(

    String token,
    String tipoToken,
    UsuarioResponse usuario

) {
}