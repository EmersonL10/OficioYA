package com.oficioya.backend.service;

import com.oficioya.backend.dto.SolicitudRequest;
import com.oficioya.backend.dto.SolicitudResponse;
import com.oficioya.backend.entity.*;
import com.oficioya.backend.enums.*;
import com.oficioya.backend.exception.*;
import com.oficioya.backend.repository.SolicitudRepository;
import com.oficioya.backend.repository.CotizacionRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final CotizacionRepository cotizacionRepository;
    private final UsuarioService usuarioService;
    private final CategoriaService categoriaService;

    public SolicitudService(
            SolicitudRepository solicitudRepository,
            CotizacionRepository cotizacionRepository,
            UsuarioService usuarioService,
            CategoriaService categoriaService) {

        this.solicitudRepository = solicitudRepository;
        this.cotizacionRepository = cotizacionRepository;
        this.usuarioService = usuarioService;
        this.categoriaService = categoriaService;
    }

    @Transactional
    public SolicitudResponse registrar(
            Long clienteId, SolicitudRequest request) {

        Usuario cliente = usuarioService.obtenerUsuario(clienteId);

        if (cliente.getRol() != Rol.CLIENTE || !cliente.isActivo()) {
            throw new AccesoDenegadoException(
                    "Solo los clientes activos pueden publicar solicitudes");
        }

        Categoria categoria = categoriaService.obtenerCategoria(
                request.categoriaId());

        if (!categoria.isActivo()) {
            throw new ReglaNegocioException(
                    "La categoría no está disponible");
        }

        Solicitud solicitud = new Solicitud();

        solicitud.setCliente(cliente);
        solicitud.setCategoria(categoria);
        solicitud.setTitulo(request.titulo());
        solicitud.setDescripcion(request.descripcion());
        solicitud.setDireccion(request.direccion());
        solicitud.setPresupuesto(request.presupuesto());
        solicitud.setEstado(EstadoSolicitud.ABIERTA);

        return convertirResponse(
                solicitudRepository.save(solicitud));
    }

    public List<SolicitudResponse> listarPorCliente(Long clienteId) {

        return solicitudRepository
                .findByClienteIdOrderByFechaCreacionDesc(clienteId)
                .stream()
                .map(this::convertirResponse)
                .toList();
    }

    public List<SolicitudResponse> listarAbiertasPorCategoria(
            Long categoriaId) {

        return solicitudRepository
                .findByCategoriaIdAndEstado(
                        categoriaId, EstadoSolicitud.ABIERTA)
                .stream()
                .filter(s -> s.getCategoria().isActivo())
                .map(this::convertirResponsePublica)
                .toList();
    }

    public SolicitudResponse buscarPorId(Long id, Long clienteId) {

        Solicitud solicitud = obtenerSolicitud(id);

        validarPropietario(solicitud, clienteId);

        return convertirResponse(solicitud);
    }

    @Transactional
    public SolicitudResponse actualizar(
            Long id, Long clienteId, SolicitudRequest request) {

        Solicitud solicitud = obtenerConBloqueo(id);

        validarPropietario(solicitud, clienteId);
        validarAbierta(solicitud);

        if (!cotizacionRepository.findBySolicitudId(id).isEmpty()) {
            throw new ReglaNegocioException(
                    "No puedes modificar una solicitud con cotizaciones");
        }

        Categoria categoria = categoriaService.obtenerCategoria(
                request.categoriaId());

        if (!categoria.isActivo()) {
            throw new ReglaNegocioException(
                    "La categoría no está disponible");
        }

        solicitud.setCategoria(categoria);
        solicitud.setTitulo(request.titulo());
        solicitud.setDescripcion(request.descripcion());
        solicitud.setDireccion(request.direccion());
        solicitud.setPresupuesto(request.presupuesto());

        return convertirResponse(
                solicitudRepository.save(solicitud));
    }

    @Transactional
    public void cancelar(Long id, Long clienteId) {

        Solicitud solicitud = obtenerConBloqueo(id);

        validarPropietario(solicitud, clienteId);
        validarAbierta(solicitud);

        List<Cotizacion> cotizaciones =
                cotizacionRepository.findBySolicitudId(id);

        for (Cotizacion cotizacion : cotizaciones) {
            cotizacion.setEstado(EstadoCotizacion.RECHAZADA);
        }

        cotizacionRepository.saveAll(cotizaciones);

        solicitud.setEstado(EstadoSolicitud.CANCELADA);

        solicitudRepository.save(solicitud);
    }

    public Solicitud obtenerSolicitud(Long id) {

        return solicitudRepository.findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Solicitud no encontrada"));
    }

    @Transactional
    public Solicitud obtenerConBloqueo(Long id) {

        return solicitudRepository.buscarConBloqueo(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Solicitud no encontrada"));
    }

    public void validarPropietario(
            Solicitud solicitud, Long clienteId) {

        if (!solicitud.getCliente().getId().equals(clienteId)) {
            throw new AccesoDenegadoException(
                    "No tienes permiso sobre esta solicitud");
        }
    }

    public void validarAbierta(Solicitud solicitud) {

        if (solicitud.getEstado() != EstadoSolicitud.ABIERTA) {
            throw new ReglaNegocioException(
                    "La solicitud ya no está abierta");
        }
    }

    private SolicitudResponse convertirResponse(Solicitud solicitud) {

        return new SolicitudResponse(
                solicitud.getId(),
                solicitud.getCliente().getId(),
                solicitud.getCliente().getNombres() + " "
                        + solicitud.getCliente().getApellidos(),
                solicitud.getCategoria().getId(),
                solicitud.getCategoria().getNombre(),
                solicitud.getTitulo(),
                solicitud.getDescripcion(),
                solicitud.getDireccion(),
                solicitud.getPresupuesto(),
                solicitud.getEstado(),
                solicitud.getFechaCreacion()
        );
    }

    private SolicitudResponse convertirResponsePublica(
            Solicitud solicitud) {

        return new SolicitudResponse(
                solicitud.getId(),
                null,
                "Cliente",
                solicitud.getCategoria().getId(),
                solicitud.getCategoria().getNombre(),
                solicitud.getTitulo(),
                solicitud.getDescripcion(),
                null,
                solicitud.getPresupuesto(),
                solicitud.getEstado(),
                solicitud.getFechaCreacion()
        );
    }
}