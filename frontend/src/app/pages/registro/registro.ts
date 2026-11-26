import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);

  readonly cargando = signal(false);
  readonly error = signal('');
  readonly exito = signal(false);
  readonly mostrarContrasena = signal(false);

  readonly formulario = this.fb.nonNullable.group({

    nombres: [
      '',
      [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(/\S/)
      ]
    ],

    apellidos: [
      '',
      [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(/\S/)
      ]
    ],

    correo: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(150)
      ]
    ],

    telefono: [
      '',
      [
        Validators.required,
        Validators.pattern(/^9[0-9]{8}$/)
      ]
    ],

    contrasena: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(72),
        Validators.pattern(/\S/)
      ]
    ],

    tipoCuenta: ['CLIENTE', Validators.required]

  });

  registrar(): void {

    if (this.cargando() || this.exito()) {
      return;
    }

    this.error.set('');

    if (this.formulario.invalid) {

      this.formulario.markAllAsTouched();

      this.error.set(
        'Completa correctamente los campos indicados para crear tu cuenta.'
      );

      return;
    }

    const datos = this.formulario.getRawValue();

    if (new TextEncoder().encode(datos.contrasena).length > 72) {
      this.error.set(
        'La contraseña supera el tamaño permitido. Utiliza una más corta.'
      );
      return;
    }

    this.cargando.set(true);

    const profesional = datos.tipoCuenta === 'PROFESIONAL';

    this.auth.registrar({

      nombres: datos.nombres.trim(),
      apellidos: datos.apellidos.trim(),
      correo: datos.correo.trim().toLowerCase(),
      telefono: datos.telefono,
      contrasena: datos.contrasena

    }, profesional).subscribe({

      next: () => {

        this.cargando.set(false);
        this.exito.set(true);
        this.formulario.reset();

      },

      error: respuesta => {

        this.cargando.set(false);

        switch (respuesta.status) {

          case 0:
            this.error.set(
              'No se pudo conectar con el servidor.'
            );
            break;

          case 400:
            this.error.set(
              'Los datos ingresados no son válidos. Revisa el formulario.'
            );
            break;

          case 409:
            this.error.set(
              'No se pudo registrar la cuenta. Es posible que el correo ya esté registrado.'
            );
            break;

          default:
            this.error.set(
              'No se pudo completar el registro. Inténtalo nuevamente.'
            );

        }

      }

    });
  }

  alternarContrasena(): void {
    this.mostrarContrasena.update(valor => !valor);
  }

  mensajeCampo(
    campo: 'nombres' | 'apellidos' | 'correo' | 'telefono' | 'contrasena'
  ): string {

    const control = this.formulario.controls[campo];

    if (!control.touched || control.valid) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Este campo es obligatorio.';
    }

    if (control.hasError('email')) {
      return 'Ingresa un correo electrónico válido.';
    }

    if (control.hasError('minlength')) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }

    if (control.hasError('maxlength')) {
      return 'Has superado la cantidad de caracteres permitida.';
    }

    if (control.hasError('pattern')) {

      if (campo === 'telefono') {
        return 'Ingresa un celular de 9 dígitos que comience con 9.';
      }

      return 'Ingresa un valor válido, no solamente espacios.';
    }

    return 'Revisa el valor ingresado.';
  }

}