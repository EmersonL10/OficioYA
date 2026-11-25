package com.oficioya.backend.repository;

import com.oficioya.backend.entity.Calificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CalificacionRepository extends JpaRepository<Calificacion, Long> {

    Optional<Calificacion> findByContratacionId(Long contratacionId);

    boolean existsByContratacionId(Long contratacionId);

    List<Calificacion> findByContratacionCotizacionProfesionalId(
            Long profesionalId);

    List<Calificacion> findByPuntuacion(int puntuacion);
}