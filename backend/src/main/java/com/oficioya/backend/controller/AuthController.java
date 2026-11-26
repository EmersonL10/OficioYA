package com.oficioya.backend.controller;

import com.oficioya.backend.dto.*;
import com.oficioya.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {

        this.authService = authService;
    }

    @PostMapping("/registro")
    public ResponseEntity<UsuarioResponse> registrar(
            @Valid @RequestBody RegistroRequest request) {

        try {
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(authService.registrarCliente(request));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    @PostMapping("/registro-profesional")
    public ResponseEntity<UsuarioResponse> registrarProfesional(
            @Valid @RequestBody RegistroRequest request) {

        try {
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(authService.registrarProfesional(request));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (AuthenticationException ex) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Credenciales incorrectas");
        }
    }

    @PostMapping("/login-admin")
    public ResponseEntity<LoginResponse> loginAdmin(
            @Valid @RequestBody LoginRequest request) {

        try {
            return ResponseEntity.ok(authService.loginAdmin(request));
        } catch (AuthenticationException ex) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Credenciales incorrectas");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> obtenerPerfil(
            Authentication authentication) {

        Long usuarioId = Long.valueOf(authentication.getName());

        return ResponseEntity.ok(
                authService.obtenerPerfil(usuarioId));
    }
}