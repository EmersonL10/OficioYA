package com.oficioya.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class SaludoController {
    @GetMapping("/api/publico/saludo")
    public String saludar() {
        return "¡Bienvenido a OficioYA!";
    }
   
    
}
