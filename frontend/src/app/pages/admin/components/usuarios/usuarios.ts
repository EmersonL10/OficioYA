import { Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Usuario, Rol } from '../../../../core/models/api.models';
import { Status } from '../../../../shared/components/status/status';

@Component({
  selector: 'app-usuarios',
  imports: [DatePipe, Status],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss'
})
export class Usuarios {
  usuarios = input.required<Usuario[]>();

  busqueda = signal('');
  rol = signal<Rol | 'TODOS'>('TODOS');
  estado = signal('TODOS');
  seleccionado = signal<Usuario | null>(null);

  usuariosFiltrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();

    return this.usuarios().filter(usuario => {
      const coincideTexto = `${usuario.nombres} ${usuario.apellidos} ${usuario.correo}`
        .toLowerCase().includes(texto);

      const coincideRol = this.rol() === 'TODOS' || usuario.rol === this.rol();

      const coincideEstado = this.estado() === 'TODOS' ||
        usuario.activo === (this.estado() === 'ACTIVO');

      return coincideTexto && coincideRol && coincideEstado;
    });
  });

  limpiarFiltros(): void {
    this.busqueda.set('');
    this.rol.set('TODOS');
    this.estado.set('TODOS');
  }

  verDetalle(usuario: Usuario): void {
    this.seleccionado.set(usuario);
  }

  cerrarDetalle(): void {
    this.seleccionado.set(null);
  }
}