package com.oficioya.backend.service;

import com.oficioya.backend.dto.ContratacionRequest;
import com.oficioya.backend.dto.ContratacionResponse;
import com.oficioya.backend.entity.*;
import com.oficioya.backend.enums.*;
import com.oficioya.backend.exception.*;
import com.oficioya.backend.repository.*;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ContratacionService {

    private final ContratacionRepository contratacionRepository;
    private final CotizacionRepository cotizacionRepository;
    private final CotizacionService cotizacionService;
    private final SolicitudService solicitudService;
    private final ProfesionalService profesionalService;

    public ContratacionService(
            ContratacionRepository contratacionRepository,
            CotizacionRepository cotizacionRepository,
            CotizacionService cotizacionService,
            SolicitudService solicitudService,
            ProfesionalService profesionalService) {

        this.contratacionRepository = contratacionRepository;
        this.cotizacionRepository = cotizacionRepository;
        this.cotizacionService = cotizacionService;
        this.solicitudService = solicitudService;
        this.profesionalService = profesionalService;
    }

    @Transactional
    public ContratacionResponse contratar(
            Long clienteId, ContratacionRequest request) {

        Cotizacion cotizacion = cotizacionService.obtenerCotizacion(
                request.cotizacionId());

        Solicitud solicitud = solicitudService.obtenerConBloqueo(
                cotizacion.getSolicitud().getId());

        solicitudService.validarPropietario(solicitud, clienteId);
        solicitudService.validarAbierta(solicitud);

        if (cotizacion.getEstado() != EstadoCotizacion.PENDIENTE) {
            throw new ReglaNegocioException(
                    "La cotización no está pendiente");
        }

        if (contratacionRepository.existsByCotizacionSolicitudId(
                solicitud.getId())) {

            throw new ConflictoException(
                    "La solicitud ya tiene una contratación");
        }

        Profesional profesional = cotizacion.getProfesional();

        if (!profesional.isDisponible()
                || !profesional.getUsuario().isActivo()
                || profesional.getUsuario().getRol() != Rol.PROFESIONAL
                || !solicitud.getCategoria().isActivo()
                || !profesional.getCategoria().getId()
                        .equals(solicitud.getCategoria().getId())) {

            throw new ReglaNegocioException(
                    "El profesional ya no está disponible para este servicio");
        }

        List<Cotizacion> cotizaciones =
                cotizacionRepository.findBySolicitudId(solicitud.getId());

        for (Cotizacion propuesta : cotizaciones) {

            if (propuesta.getId().equals(cotizacion.getId())) {
                propuesta.setEstado(EstadoCotizacion.ACEPTADA);
            } else {
                propuesta.setEstado(EstadoCotizacion.RECHAZADA);
            }
        }

        cotizacionRepository.saveAll(cotizaciones);

        solicitud.setEstado(EstadoSolicitud.CONTRATADA);

        Contratacion contratacion = new Contratacion();

        contratacion.setCotizacion(cotizacion);
        contratacion.setEstado(EstadoContratacion.PENDIENTE);

        return convertirResponse(
                contratacionRepository.save(contratacion));
    }

    @Transactional
    public ContratacionResponse iniciar(Long id, Long usuarioId) {

        Contratacion contratacion = obtenerConBloqueo(id);

        validarProfesional(contratacion, usuarioId);

        if (contratacion.getEstado() != EstadoContratacion.PENDIENTE) {
            throw new ReglaNegocioException(
                    "La contratación no está pendiente");
        }

        contratacion.setEstado(EstadoContratacion.EN_PROCESO);
        contratacion.setFechaInicio(LocalDateTime.now());

        return convertirResponse(
                contratacionRepository.save(contratacion));
    }

    @Transactional
    public ContratacionResponse finalizar(Long id, Long clienteId) {

        Contratacion contratacion = obtenerConBloqueo(id);

        Solicitud solicitud =
                contratacion.getCotizacion().getSolicitud();

        solicitudService.validarPropietario(solicitud, clienteId);

        if (contratacion.getEstado() != EstadoContratacion.EN_PROCESO) {
            throw new ReglaNegocioException(
                    "El servicio debe estar en proceso");
        }

        contratacion.setEstado(EstadoContratacion.FINALIZADA);
        contratacion.setFechaFinalizacion(LocalDateTime.now());

        solicitud.setEstado(EstadoSolicitud.FINALIZADA);

        return convertirResponse(
                contratacionRepository.save(contratacion));
    }

    @Transactional
    public ContratacionResponse cancelar(Long id, Long clienteId) {

        Contratacion contratacion = obtenerConBloqueo(id);

        Solicitud solicitud =
                contratacion.getCotizacion().getSolicitud();

        solicitudService.validarPropietario(solicitud, clienteId);

        if (contratacion.getEstado() != EstadoContratacion.PENDIENTE) {
            throw new ReglaNegocioException(
                    "Solo se pueden cancelar contrataciones pendientes");
        }

        contratacion.setEstado(EstadoContratacion.CANCELADA);
        solicitud.setEstado(EstadoSolicitud.CANCELADA);

        contratacion.getCotizacion()
                .setEstado(EstadoCotizacion.RECHAZADA);

        return convertirResponse(
                contratacionRepository.save(contratacion));
    }

    public List<ContratacionResponse> listarPorCliente(Long clienteId) {

        return contratacionRepository
                .findByCotizacionSolicitudClienteId(clienteId)
                .stream()
                .map(this::convertirResponse)
                .toList();
    }

    public List<ContratacionResponse> listarPorProfesional(Long usuarioId) {

        Profesional profesional =
                profesionalService.obtenerPorUsuario(usuarioId);

        return contratacionRepository
                .findByCotizacionProfesionalId(profesional.getId())
                .stream()
                .map(this::convertirResponse)
                .toList();
    }

    public Contratacion obtenerContratacion(Long id) {

        return contratacionRepository.findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Contratación no encontrada"));
    }

    @Transactional
    public Contratacion obtenerConBloqueo(Long id) {

        return contratacionRepository.buscarConBloqueo(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Contratación no encontrada"));
    }

    private void validarProfesional(
            Contratacion contratacion, Long usuarioId) {

        Usuario usuario =
                contratacion.getCotizacion().getProfesional().getUsuario();

        if (!usuario.getId().equals(usuarioId)
                || !usuario.isActivo()
                || usuario.getRol() != Rol.PROFESIONAL) {

            throw new AccesoDenegadoException(
                    "No tienes permiso sobre esta contratación");
        }
    }

    private ContratacionResponse convertirResponse(
            Contratacion contratacion) {

        Cotizacion cotizacion = contratacion.getCotizacion();
        Solicitud solicitud = cotizacion.getSolicitud();
        Usuario cliente = solicitud.getCliente();
        Profesional profesional = cotizacion.getProfesional();
        Usuario usuario = profesional.getUsuario();

        return new ContratacionResponse(
                contratacion.getId(),
                cotizacion.getId(),
                solicitud.getId(),
                solicitud.getTitulo(),
                cliente.getId(),
                cliente.getNombres() + " " + cliente.getApellidos(),
                profesional.getId(),
                usuario.getNombres() + " " + usuario.getApellidos(),
                cotizacion.getMonto(),
                contratacion.getEstado(),
                contratacion.getFechaContratacion(),
                contratacion.getFechaInicio(),
                contratacion.getFechaFinalizacion()
        );
    }
}