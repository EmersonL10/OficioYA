package com.oficioya.backend.service;

import com.oficioya.backend.dto.ProfesionalRequest;
import com.oficioya.backend.dto.ProfesionalResponse;
import com.oficioya.backend.entity.Categoria;
import com.oficioya.backend.entity.Profesional;
import com.oficioya.backend.entity.Usuario;
import com.oficioya.backend.enums.Rol;
import com.oficioya.backend.exception.AccesoDenegadoException;
import com.oficioya.backend.exception.ConflictoException;
import com.oficioya.backend.exception.RecursoNoEncontradoException;
import com.oficioya.backend.exception.ReglaNegocioException;
import com.oficioya.backend.repository.ProfesionalRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProfesionalService {

    private final ProfesionalRepository profesionalRepository;
    private final UsuarioService usuarioService;
    private final CategoriaService categoriaService;

    public ProfesionalService(
            ProfesionalRepository profesionalRepository,
            UsuarioService usuarioService,
            CategoriaService categoriaService) {

        this.profesionalRepository = profesionalRepository;
        this.usuarioService = usuarioService;
        this.categoriaService = categoriaService;
    }

    // Registrar perfil profesional

    @Transactional
    public ProfesionalResponse registrar(
            Long usuarioId, ProfesionalRequest request) {

        Usuario usuario = usuarioService.obtenerUsuario(usuarioId);

        if (usuario.getRol() != Rol.PROFESIONAL
                || !usuario.isActivo()) {

            throw new AccesoDenegadoException(
                    "El usuario no está autorizado");
        }

        if (profesionalRepository.existsByUsuarioId(usuarioId)) {

            throw new ConflictoException(
                    "El usuario ya tiene un perfil profesional");
        }

        Categoria categoria = categoriaService.obtenerCategoria(
                request.categoriaId());

        if (!categoria.isActivo()) {

            throw new ReglaNegocioException(
                    "La categoría no está disponible");
        }

        Profesional profesional = new Profesional();

        profesional.setUsuario(usuario);
        profesional.setCategoria(categoria);
        profesional.setDescripcion(request.descripcion());
        profesional.setExperienciaAnios(request.experienciaAnios());
        profesional.setDisponible(true);

        return convertirResponse(
                profesionalRepository.save(profesional));
    }

    // Listar profesionales disponibles

    public List<ProfesionalResponse> listarDisponibles() {

        return profesionalRepository.findByDisponibleTrue()
                .stream()
                .filter(p -> p.getUsuario().isActivo())
                .filter(p -> p.getCategoria().isActivo())
                .map(this::convertirResponse)
                .toList();
    }

    // Buscar profesionales por categoria

    public List<ProfesionalResponse> buscarPorCategoria(
            Long categoriaId) {

        return profesionalRepository
                .findByCategoriaIdAndDisponibleTrue(categoriaId)
                .stream()
                .filter(p -> p.getUsuario().isActivo())
                .filter(p -> p.getCategoria().isActivo())
                .map(this::convertirResponse)
                .toList();
    }

    // Consultar perfil propio

    public ProfesionalResponse buscarPorUsuario(Long usuarioId) {

        return convertirResponse(obtenerPorUsuario(usuarioId));
    }

    // Actualizar perfil propio

    @Transactional
    public ProfesionalResponse actualizar(
            Long usuarioId, ProfesionalRequest request) {

        Profesional profesional = obtenerPorUsuario(usuarioId);

        Categoria categoria = categoriaService.obtenerCategoria(
                request.categoriaId());

        if (!categoria.isActivo()) {

            throw new ReglaNegocioException(
                    "La categoría no está disponible");
        }

        profesional.setCategoria(categoria);
        profesional.setDescripcion(request.descripcion());
        profesional.setExperienciaAnios(request.experienciaAnios());

        return convertirResponse(
                profesionalRepository.save(profesional));
    }

    // Cambiar disponibilidad

    @Transactional
    public ProfesionalResponse cambiarDisponibilidad(
            Long usuarioId, boolean disponible) {

        Profesional profesional = obtenerPorUsuario(usuarioId);

        profesional.setDisponible(disponible);

        return convertirResponse(
                profesionalRepository.save(profesional));
    }

    // Obtener profesional por ID

    public Profesional obtenerProfesional(Long id) {

        return profesionalRepository.findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Profesional no encontrado"));
    }

    // Obtener profesional por usuario

    public Profesional obtenerPorUsuario(Long usuarioId) {

        return profesionalRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Perfil profesional no encontrado"));
    }

    // Convertir entidad a DTO

    private ProfesionalResponse convertirResponse(
            Profesional profesional) {

        return new ProfesionalResponse(
                profesional.getId(),
                profesional.getUsuario().getId(),
                profesional.getUsuario().getNombres(),
                profesional.getUsuario().getApellidos(),
                profesional.getCategoria().getId(),
                profesional.getCategoria().getNombre(),
                profesional.getDescripcion(),
                profesional.getExperienciaAnios(),
                profesional.isDisponible()
        );
    }
}