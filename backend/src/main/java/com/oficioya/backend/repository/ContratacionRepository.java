package com.oficioya.backend.repository;

import com.oficioya.backend.entity.Contratacion;
import com.oficioya.backend.enums.EstadoContratacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ContratacionRepository extends JpaRepository<Contratacion, Long> {

    Optional<Contratacion> findByCotizacionId(Long cotizacionId);

    boolean existsByCotizacionId(Long cotizacionId);

    List<Contratacion> findByEstado(EstadoContratacion estado);

    List<Contratacion> findByCotizacionSolicitudClienteId(Long clienteId);

    List<Contratacion> findByCotizacionProfesionalId(Long profesionalId);

    boolean existsByCotizacionSolicitudId(Long solicitudId);
}