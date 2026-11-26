package com.oficioya.backend.repository;

import com.oficioya.backend.entity.Solicitud;
import com.oficioya.backend.enums.EstadoSolicitud;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {

    List<Solicitud> findByClienteId(Long clienteId);

    List<Solicitud> findByCategoriaId(Long categoriaId);

    List<Solicitud> findByEstado(EstadoSolicitud estado);

    List<Solicitud> findByCategoriaIdAndEstado(
            Long categoriaId, EstadoSolicitud estado);

    List<Solicitud> findByClienteIdOrderByFechaCreacionDesc(
            Long clienteId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Solicitud s WHERE s.id = :id")
    Optional<Solicitud> buscarConBloqueo(@Param("id") Long id);
}