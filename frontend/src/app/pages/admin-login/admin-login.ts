import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { Auth } from '../../core/services/auth';
import { Notification } from '../../shared/components/notification/notification';

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule, Notification],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss'
})
export class AdminLogin {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  cargando = signal(false);
  error = signal('');
  mostrarContrasena = signal(false);

  formulario = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    contrasena: ['', [Validators.required, Validators.maxLength(72)]]
  });

  iniciarSesion(): void {
    if (this.cargando()) return;

    this.error.set('');

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.error.set('Ingresa correctamente tus credenciales.');
      return;
    }

    const datos = this.formulario.getRawValue();

    this.cargando.set(true);

    this.auth.login({
      correo: datos.correo.trim().toLowerCase(),
      contrasena: datos.contrasena
    }).pipe(
      finalize(() => this.cargando.set(false))
    ).subscribe({
      next: respuesta => {
        if (respuesta.usuario.rol !== 'ADMIN') {
          this.auth.cerrarSesion();
          this.error.set('No tienes autorización para acceder.');
          return;
        }

        this.router.navigate(['/admin']);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(error.status === 0
          ? 'No se pudo conectar con el servidor.'
          : 'Credenciales incorrectas o acceso no autorizado.');
      }
    });
  }

  alternarContrasena(): void {
    this.mostrarContrasena.update(valor => !valor);
  }
}