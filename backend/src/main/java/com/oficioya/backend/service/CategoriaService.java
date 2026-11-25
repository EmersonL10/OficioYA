package com.oficioya.backend.service;

import com.oficioya.backend.dto.CategoriaRequest;
import com.oficioya.backend.dto.CategoriaResponse;
import com.oficioya.backend.entity.Categoria;
import com.oficioya.backend.exception.ConflictoException;
import com.oficioya.backend.exception.RecursoNoEncontradoException;
import com.oficioya.backend.repository.CategoriaRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    // Listar todas las categorias

    public List<CategoriaResponse> listar() {

        return categoriaRepository.findAll()
                .stream()
                .map(this::convertirResponse)
                .toList();
    }

    // Listar categorias activas

    public List<CategoriaResponse> listarActivas() {

        return categoriaRepository.findByActivoTrue()
                .stream()
                .map(this::convertirResponse)
                .toList();
    }

    // Buscar categoria

    public CategoriaResponse buscarPorId(Long id) {

        return convertirResponse(obtenerCategoria(id));
    }

    // Registrar categoria

    @Transactional
    public CategoriaResponse registrar(CategoriaRequest request) {

        String nombre = request.nombre().trim();

        if (categoriaRepository.existsByNombreIgnoreCase(nombre)) {
            throw new ConflictoException(
                    "La categoría ya está registrada");
        }

        Categoria categoria = new Categoria();

        categoria.setNombre(nombre);
        categoria.setDescripcion(request.descripcion());
        categoria.setActivo(true);

        return convertirResponse(
                categoriaRepository.save(categoria));
    }

    // Actualizar categoria

    @Transactional
    public CategoriaResponse actualizar(
            Long id, CategoriaRequest request) {

        Categoria categoria = obtenerCategoria(id);

        String nombre = request.nombre().trim();

        if (!categoria.getNombre().equalsIgnoreCase(nombre)
                && categoriaRepository.existsByNombreIgnoreCase(nombre)) {

            throw new ConflictoException(
                    "El nombre de la categoría ya existe");
        }

        categoria.setNombre(nombre);
        categoria.setDescripcion(request.descripcion());

        return convertirResponse(
                categoriaRepository.save(categoria));
    }

    // Desactivar categoria

    @Transactional
    public void desactivar(Long id) {

        Categoria categoria = obtenerCategoria(id);

        categoria.setActivo(false);

        categoriaRepository.save(categoria);
    }

    // Activar categoria

    @Transactional
    public CategoriaResponse activar(Long id) {

        Categoria categoria = obtenerCategoria(id);

        categoria.setActivo(true);

        return convertirResponse(
                categoriaRepository.save(categoria));
    }

    // Obtener entidad

    public Categoria obtenerCategoria(Long id) {

        return categoriaRepository.findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Categoría no encontrada"));
    }

    // Convertir entidad a DTO

    private CategoriaResponse convertirResponse(Categoria categoria) {

        return new CategoriaResponse(
                categoria.getId(),
                categoria.getNombre(),
                categoria.getDescripcion(),
                categoria.isActivo()
        );
    }
}