package com.oficioya.backend.repository;

import com.oficioya.backend.entity.Profesional;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProfesionalRepository extends JpaRepository<Profesional, Long> {

    Optional<Profesional> findByUsuarioId(Long usuarioId);

    boolean existsByUsuarioId(Long usuarioId);

    List<Profesional> findByCategoriaId(Long categoriaId);

    List<Profesional> findByDisponibleTrue();

    List<Profesional> findByCategoriaIdAndDisponibleTrue(Long categoriaId);
}