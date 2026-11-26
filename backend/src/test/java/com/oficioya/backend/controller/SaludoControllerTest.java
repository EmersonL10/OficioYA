package com.oficioya.backend.controller;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class SaludoControllerTest {

    @Test
    void debeRetornarSaludo() {

        SaludoController controlador = new SaludoController();

        String resultado = controlador.saludar();

        assertEquals("¡Bienvenido a OficioYA!", resultado);
    }
}