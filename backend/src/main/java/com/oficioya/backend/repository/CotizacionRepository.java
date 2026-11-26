package com.oficioya.backend.repository;

import com.oficioya.backend.entity.Cotizacion;
import com.oficioya.backend.enums.EstadoCotizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CotizacionRepository extends JpaRepository<Cotizacion, Long> {

    List<Cotizacion> findBySolicitudId(Long solicitudId);

    List<Cotizacion> findByProfesionalId(Long profesionalId);

    List<Cotizacion> findByEstado(EstadoCotizacion estado);

    boolean existsBySolicitudIdAndProfesionalId(
            Long solicitudId, Long profesionalId);

    List<Cotizacion> findBySolicitudIdAndEstado(
            Long solicitudId, EstadoCotizacion estado);
}