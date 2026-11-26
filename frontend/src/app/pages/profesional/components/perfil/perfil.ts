import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Categoria, Profesional, ProfesionalRequest } from '../../../../core/models/api.models';
import { Status } from '../../../../shared/components/status/status';
import { Notification } from '../../../../shared/components/notification/notification';

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, Status, Notification],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss'
})
export class Perfil {
  private fb = inject(FormBuilder);

  perfil = input.required<Profesional | null>();
  categorias = input.required<Categoria[]>();
  procesando = input(false);

  guardar = output<ProfesionalRequest>();
  cambiarDisponibilidad = output<boolean>();

  error = signal('');

  formulario = this.fb.group({
    categoriaId: this.fb.control<number | null>(null, Validators.required),
    descripcion: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(1000)
    ]),
    experienciaAnios: this.fb.nonNullable.control(0, [
      Validators.required,
      Validators.min(0),
      Validators.max(70)
    ])
  });

  constructor() {
    effect(() => {
      const datos = this.perfil();

      this.formulario.reset({
        categoriaId: datos?.categoriaId ?? null,
        descripcion: datos?.descripcion ?? '',
        experienciaAnios: datos?.experienciaAnios ?? 0
      });
    });
  }

  enviar(): void {
    if (this.procesando()) return;

    this.error.set('');

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.error.set('Completa correctamente los datos de tu perfil.');
      return;
    }

    const valores = this.formulario.getRawValue();

    if (valores.descripcion.trim().length < 10) {
      this.error.set('La descripción debe contener al menos 10 caracteres.');
      return;
    }

    if (!Number.isInteger(valores.experienciaAnios)) {
      this.error.set('Los años de experiencia deben ser un número entero.');
      return;
    }

    this.guardar.emit({
      categoriaId: valores.categoriaId!,
      descripcion: valores.descripcion.trim(),
      experienciaAnios: valores.experienciaAnios
    });
  }
}