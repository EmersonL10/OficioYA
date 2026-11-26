import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly cargando = signal(false);
  readonly error = signal('');
  readonly mostrarContrasena = signal(false);

  readonly formulario = this.fb.nonNullable.group({
    correo: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(150)
      ]
    ],
    contrasena: [
      '',
      [
        Validators.required,
        Validators.maxLength(72)
      ]
    ]
  });

  iniciarSesion(): void {

    // Evitar peticiones duplicadas
    if (this.cargando()) {
      return;
    }

    this.error.set('');

    // Validar antes de enviar al backend
    if (this.formulario.invalid) {

      this.formulario.markAllAsTouched();

      this.error.set(
        'Completa correctamente los campos indicados para iniciar sesión.'
      );

      return;
    }

    this.cargando.set(true);

    const datos = this.formulario.getRawValue();

    this.auth.login({
      correo: datos.correo.trim().toLowerCase(),
      contrasena: datos.contrasena
    }).subscribe({

      next: respuesta => {

        this.cargando.set(false);

        switch (respuesta.usuario.rol) {

          case 'CLIENTE':
            this.router.navigate(['/cliente']);
            break;

          case 'PROFESIONAL':
            this.router.navigate(['/profesional']);
            break;

          case 'ADMIN':
            this.router.navigate(['/admin']);
            break;

        }

      },

      error: respuesta => {

        this.cargando.set(false);

        switch (respuesta.status) {

          case 0:
            this.error.set(
              'No se pudo conectar con el servidor. Inténtalo nuevamente.'
            );
            break;

          case 400:
            this.error.set(
              'Los datos ingresados no son válidos. Revisa los campos.'
            );
            break;

          case 401:
            this.error.set(
              'El correo electrónico o la contraseña son incorrectos.'
            );
            break;

          case 403:
            this.error.set(
              'No tienes autorización para acceder al sistema.'
            );
            break;

          case 429:
            this.error.set(
              'Demasiados intentos. Espera un momento antes de continuar.'
            );
            break;

          default:
            this.error.set(
              'No se pudo iniciar sesión. Inténtalo nuevamente.'
            );

        }

      }

    });
  }

  alternarContrasena(): void {
    this.mostrarContrasena.update(valor => !valor);
  }

}