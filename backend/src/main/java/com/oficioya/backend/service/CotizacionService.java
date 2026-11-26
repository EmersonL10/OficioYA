package com.oficioya.backend.service;

import com.oficioya.backend.dto.CotizacionRequest;
import com.oficioya.backend.dto.CotizacionResponse;
import com.oficioya.backend.entity.*;
import com.oficioya.backend.enums.*;
import com.oficioya.backend.exception.*;
import com.oficioya.backend.repository.CotizacionRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CotizacionService {

    private final CotizacionRepository cotizacionRepository;
    private final ProfesionalService profesionalService;
    private final SolicitudService solicitudService;

    public CotizacionService(
            CotizacionRepository cotizacionRepository,
            ProfesionalService profesionalService,
            SolicitudService solicitudService) {

        this.cotizacionRepository = cotizacionRepository;
        this.profesionalService = profesionalService;
        this.solicitudService = solicitudService;
    }

    @Transactional
    public CotizacionResponse registrar(
            Long usuarioId, CotizacionRequest request) {

        Profesional profesional =
                profesionalService.obtenerPorUsuario(usuarioId);

        if (!profesional.getUsuario().isActivo()
                || profesional.getUsuario().getRol() != Rol.PROFESIONAL) {

            throw new AccesoDenegadoException(
                    "El usuario no está autorizado");
        }

        if (!profesional.isDisponible()) {
            throw new ReglaNegocioException(
                    "El profesional no está disponible");
        }

        Solicitud solicitud = solicitudService.obtenerConBloqueo(
                request.solicitudId());

        solicitudService.validarAbierta(solicitud);

        if (!solicitud.getCategoria().isActivo()) {
            throw new ReglaNegocioException(
                    "La categoría no está disponible");
        }

        if (!profesional.getCategoria().getId()
                .equals(solicitud.getCategoria().getId())) {

            throw new ReglaNegocioException(
                    "La solicitud no pertenece a tu especialidad");
        }

        if (cotizacionRepository.existsBySolicitudIdAndProfesionalId(
                solicitud.getId(), profesional.getId())) {

            throw new ConflictoException(
                    "Ya existe una cotización para esta solicitud");
        }

        Cotizacion cotizacion = new Cotizacion();

        cotizacion.setSolicitud(solicitud);
        cotizacion.setProfesional(profesional);
        cotizacion.setMonto(request.monto());
        cotizacion.setDescripcion(request.descripcion());
        cotizacion.setPlazoDias(request.plazoDias());
        cotizacion.setEstado(EstadoCotizacion.PENDIENTE);

        return convertirResponse(
                cotizacionRepository.save(cotizacion));
    }

    public List<CotizacionResponse> listarPorSolicitud(
            Long solicitudId, Long clienteId) {

        Solicitud solicitud =
                solicitudService.obtenerSolicitud(solicitudId);

        solicitudService.validarPropietario(solicitud, clienteId);

        return cotizacionRepository.findBySolicitudId(solicitudId)
                .stream()
                .map(this::convertirResponse)
                .toList();
    }

    public List<CotizacionResponse> listarPorProfesional(Long usuarioId) {

        Profesional profesional =
                profesionalService.obtenerPorUsuario(usuarioId);

        return cotizacionRepository
                .findByProfesionalId(profesional.getId())
                .stream()
                .map(this::convertirResponse)
                .toList();
    }

    public Cotizacion obtenerCotizacion(Long id) {

        return cotizacionRepository.findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Cotización no encontrada"));
    }

    private CotizacionResponse convertirResponse(Cotizacion cotizacion) {

        Usuario usuario = cotizacion.getProfesional().getUsuario();

        return new CotizacionResponse(
                cotizacion.getId(),
                cotizacion.getSolicitud().getId(),
                cotizacion.getSolicitud().getTitulo(),
                cotizacion.getProfesional().getId(),
                usuario.getNombres() + " " + usuario.getApellidos(),
                cotizacion.getMonto(),
                cotizacion.getDescripcion(),
                cotizacion.getPlazoDias(),
                cotizacion.getEstado(),
                cotizacion.getFechaEnvio()
        );
    }
}