package com.oficioya.backend.service;

import com.oficioya.backend.dto.CalificacionRequest;
import com.oficioya.backend.dto.CalificacionResponse;
import com.oficioya.backend.entity.*;
import com.oficioya.backend.enums.EstadoContratacion;
import com.oficioya.backend.exception.*;
import com.oficioya.backend.repository.CalificacionRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CalificacionService {

    private final CalificacionRepository calificacionRepository;
    private final ContratacionService contratacionService;
    private final SolicitudService solicitudService;
    private final ProfesionalService profesionalService;

    public CalificacionService(
            CalificacionRepository calificacionRepository,
            ContratacionService contratacionService,
            SolicitudService solicitudService,
            ProfesionalService profesionalService) {

        this.calificacionRepository = calificacionRepository;
        this.contratacionService = contratacionService;
        this.solicitudService = solicitudService;
        this.profesionalService = profesionalService;
    }

    @Transactional
    public CalificacionResponse registrar(
            Long clienteId, CalificacionRequest request) {

        Contratacion contratacion =
                contratacionService.obtenerConBloqueo(
                        request.contratacionId());

        Solicitud solicitud =
                contratacion.getCotizacion().getSolicitud();

        solicitudService.validarPropietario(solicitud, clienteId);

        if (contratacion.getEstado() != EstadoContratacion.FINALIZADA) {
            throw new ReglaNegocioException(
                    "Solo se pueden calificar servicios finalizados");
        }

        if (calificacionRepository.existsByContratacionId(
                contratacion.getId())) {

            throw new ConflictoException(
                    "El servicio ya fue calificado");
        }

        if (request.puntuacion() == null
                || request.puntuacion() < 1
                || request.puntuacion() > 5) {

            throw new ReglaNegocioException(
                    "La puntuación debe estar entre 1 y 5");
        }

        Calificacion calificacion = new Calificacion();

        calificacion.setContratacion(contratacion);
        calificacion.setPuntuacion(request.puntuacion());
        calificacion.setComentario(request.comentario());

        return convertirResponse(
                calificacionRepository.save(calificacion));
    }

    public List<CalificacionResponse> listarPorProfesional(
            Long profesionalId) {

        profesionalService.obtenerProfesional(profesionalId);

        return calificacionRepository
                .findByContratacionCotizacionProfesionalId(profesionalId)
                .stream()
                .map(this::convertirResponse)
                .toList();
    }

    public double calcularPromedio(Long profesionalId) {

        profesionalService.obtenerProfesional(profesionalId);

        return calificacionRepository
                .findByContratacionCotizacionProfesionalId(profesionalId)
                .stream()
                .mapToInt(Calificacion::getPuntuacion)
                .average()
                .orElse(0.0);
    }

    private CalificacionResponse convertirResponse(
            Calificacion calificacion) {

        Contratacion contratacion = calificacion.getContratacion();
        Cotizacion cotizacion = contratacion.getCotizacion();
        Profesional profesional = cotizacion.getProfesional();
        Usuario usuario = profesional.getUsuario();
        Usuario cliente = cotizacion.getSolicitud().getCliente();

        return new CalificacionResponse(
                calificacion.getId(),
                contratacion.getId(),
                profesional.getId(),
                usuario.getNombres() + " " + usuario.getApellidos(),
                cliente.getNombres(),
                calificacion.getPuntuacion(),
                calificacion.getComentario(),
                calificacion.getFechaCalificacion()
        );
    }
}