import { Component, computed, inject, input, output, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Profesional, Solicitud, Cotizacion, CotizacionRequest } from '../../../../core/models/api.models';
import { Notification } from '../../../../shared/components/notification/notification';

@Component({
  selector: 'app-oportunidades',
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe, Notification],
  templateUrl: './oportunidades.html',
  styleUrl: './oportunidades.scss'
})
export class Oportunidades {
  private fb = inject(FormBuilder);

  perfil = input.required<Profesional | null>();
  solicitudes = input.required<Solicitud[]>();
  cotizaciones = input.required<Cotizacion[]>();
  procesando = input(false);

  cotizar = output<CotizacionRequest>();
  navegar = output<string>();

  seleccionada = signal<number | null>(null);
  busqueda = signal('');
  error = signal('');

  solicitudesFiltradas = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();

    return this.solicitudes().filter(s =>
      `${s.titulo} ${s.descripcion} ${s.categoriaNombre}`
        .toLowerCase().includes(texto)
    );
  });

  formulario = this.fb.group({
    monto: this.fb.control<number | null>(null, [
      Validators.required, Validators.min(0.01),
      Validators.max(99999999.99)
    ]),
    descripcion: this.fb.nonNullable.control('', [
      Validators.required, Validators.minLength(10),
      Validators.maxLength(2000)
    ]),
    plazoDias: this.fb.nonNullable.control(1, [
      Validators.required, Validators.min(1), Validators.max(365)
    ])
  });

  yaCotizada(id: number): boolean {
    return this.cotizaciones().some(c => c.solicitudId === id);
  }

  abrirCotizacion(solicitud: Solicitud): void {
    this.error.set('');

    if (!this.perfil()?.disponible) {
      this.error.set('Activa tu disponibilidad antes de enviar una propuesta.');
      return;
    }

    if (this.yaCotizada(solicitud.id)) {
      this.error.set('Ya enviaste una cotización para esta solicitud.');
      return;
    }

    this.seleccionada.set(solicitud.id);
    this.formulario.reset({
      monto: solicitud.presupuesto,
      descripcion: '',
      plazoDias: 1
    });
  }

  enviar(): void {
    if (this.procesando()) return;

    this.error.set('');
    const solicitudId = this.seleccionada();

    if (this.formulario.invalid || solicitudId === null) {
      this.formulario.markAllAsTouched();
      this.error.set('Completa correctamente los datos de tu propuesta.');
      return;
    }

    const datos = this.formulario.getRawValue();
    const monto = datos.monto!;

    if (datos.descripcion.trim().length < 10) {
      this.error.set('Describe tu propuesta con al menos 10 caracteres.');
      return;
    }

    if (!Number.isInteger(datos.plazoDias)) {
      this.error.set('El plazo debe expresarse en días enteros.');
      return;
    }

    if (Math.abs(monto * 100 - Math.round(monto * 100)) > 0.000001) {
      this.error.set('El monto debe tener como máximo dos decimales.');
      return;
    }

    this.cotizar.emit({
      solicitudId,
      monto,
      descripcion: datos.descripcion.trim(),
      plazoDias: datos.plazoDias
    });
  }

  cerrarFormulario(): void {
    this.seleccionada.set(null);
    this.formulario.reset();
    this.error.set('');
  }
}