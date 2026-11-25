package com.oficioya.backend.repository;

import com.oficioya.backend.entity.Solicitud;
import com.oficioya.backend.enums.EstadoSolicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {

    List<Solicitud> findByClienteId(Long clienteId);

    List<Solicitud> findByCategoriaId(Long categoriaId);

    List<Solicitud> findByEstado(EstadoSolicitud estado);

    List<Solicitud> findByCategoriaIdAndEstado(
            Long categoriaId, EstadoSolicitud estado);

    List<Solicitud> findByClienteIdOrderByFechaCreacionDesc(
            Long clienteId);
}