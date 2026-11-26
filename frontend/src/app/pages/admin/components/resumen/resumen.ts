import { Component, computed, input, output } from '@angular/core';
import { Usuario, Categoria } from '../../../../core/models/api.models';
import { Status } from '../../../../shared/components/status/status';

@Component({
  selector: 'app-resumen',
  imports: [Status],
  templateUrl: './resumen.html',
  styleUrl: './resumen.scss'
})
export class Resumen {
  nombre = input.required<string>();
  usuarios = input.required<Usuario[]>();
  categorias = input.required<Categoria[]>();

  navegar = output<string>();

  indicadores = computed(() => [
    {
      nombre: 'Usuarios registrados',
      valor: this.usuarios().length
    },
    {
      nombre: 'Clientes',
      valor: this.usuarios().filter(u => u.rol === 'CLIENTE').length
    },
    {
      nombre: 'Profesionales',
      valor: this.usuarios().filter(u => u.rol === 'PROFESIONAL').length
    },
    {
      nombre: 'Categorías activas',
      valor: this.categorias().filter(c => c.activo).length
    }
  ]);

  usuariosRecientes = computed(() =>
    [...this.usuarios()]
      .sort((a, b) => b.fechaRegistro.localeCompare(a.fechaRegistro))
      .slice(0, 5)
  );
}