package com.oficioya.backend.dto;

public record CategoriaResponse(

    Long id,
    String nombre,
    String descripcion,
    boolean activo

) {
}