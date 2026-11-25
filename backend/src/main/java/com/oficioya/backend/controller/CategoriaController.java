package com.oficioya.backend.controller;

import com.oficioya.backend.dto.*;
import com.oficioya.backend.service.CategoriaService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping("/publico/categorias")
    public List<CategoriaResponse> listarActivas() {
        return categoriaService.listarActivas();
    }

    @GetMapping("/admin/categorias")
    public List<CategoriaResponse> listar() {
        return categoriaService.listar();
    }

    @GetMapping("/admin/categorias/{id}")
    public CategoriaResponse buscar(@PathVariable Long id) {
        return categoriaService.buscarPorId(id);
    }

    @PostMapping("/admin/categorias")
    @ResponseStatus(HttpStatus.CREATED)
    public CategoriaResponse registrar(
            @Valid @RequestBody CategoriaRequest request) {

        return categoriaService.registrar(request);
    }

    @PutMapping("/admin/categorias/{id}")
    public CategoriaResponse actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CategoriaRequest request) {

        return categoriaService.actualizar(id, request);
    }

    @DeleteMapping("/admin/categorias/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desactivar(@PathVariable Long id) {
        categoriaService.desactivar(id);
    }

    @PatchMapping("/admin/categorias/{id}/activar")
    public CategoriaResponse activar(@PathVariable Long id) {
        return categoriaService.activar(id);
    }
}