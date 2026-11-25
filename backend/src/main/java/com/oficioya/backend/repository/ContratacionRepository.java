package com.oficioya.backend.repository;

import com.oficioya.backend.entity.Contratacion;
import com.oficioya.backend.enums.EstadoContratacion;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ContratacionRepository
        extends JpaRepository<Contratacion, Long> {

    Optional<Contratacion> findByCotizacionId(Long cotizacionId);

    boolean existsByCotizacionId(Long cotizacionId);

    List<Contratacion> findByEstado(EstadoContratacion estado);

    List<Contratacion> findByCotizacionSolicitudClienteId(
            Long clienteId);

    List<Contratacion> findByCotizacionProfesionalId(
            Long profesionalId);

    boolean existsByCotizacionSolicitudId(Long solicitudId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Contratacion c WHERE c.id = :id")
    Optional<Contratacion> buscarConBloqueo(@Param("id") Long id);
}