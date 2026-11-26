package com.oficioya.backend.entity;

import com.oficioya.backend.enums.EstadoContratacion;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contrataciones")
public class Contratacion {

    // Atributos

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cotizacion_id", nullable = false, unique = true)
    private Cotizacion cotizacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoContratacion estado = EstadoContratacion.PENDIENTE;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaContratacion;

    private LocalDateTime fechaInicio;

    private LocalDateTime fechaFinalizacion;

    // Constructor

    public Contratacion() {
    }

    // Ciclo de vida

    @PrePersist
    public void prePersist() {
        fechaContratacion = LocalDateTime.now();
    }

    // Getters y setters

    public Long getId() {
        return id;
    }

    public Cotizacion getCotizacion() {
        return cotizacion;
    }

    public void setCotizacion(Cotizacion cotizacion) {
        this.cotizacion = cotizacion;
    }

    public EstadoContratacion getEstado() {
        return estado;
    }

    public void setEstado(EstadoContratacion estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaContratacion() {
        return fechaContratacion;
    }

    public LocalDateTime getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDateTime fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDateTime getFechaFinalizacion() {
        return fechaFinalizacion;
    }

    public void setFechaFinalizacion(LocalDateTime fechaFinalizacion) {
        this.fechaFinalizacion = fechaFinalizacion;
    }
}