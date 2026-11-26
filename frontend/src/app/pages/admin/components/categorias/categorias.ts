import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Categoria, CategoriaRequest } from '../../../../core/models/api.models';
import { Status } from '../../../../shared/components/status/status';
import { Notification } from '../../../../shared/components/notification/notification';

@Component({
  selector: 'app-categorias',
  imports: [ReactiveFormsModule, Status, Notification],
  templateUrl: './categorias.html',
  styleUrl: './categorias.scss'
})
export class Categorias {
  private fb = inject(FormBuilder);

  categorias = input.required<Categoria[]>();
  procesando = input(false);

  guardar = output<{ id: number | null; datos: CategoriaRequest }>();
  cambiarEstado = output<Categoria>();

  busqueda = signal('');
  estado = signal('TODAS');
  mostrarFormulario = signal(false);
  categoriaEditada = signal<number | null>(null);
  error = signal('');

  formulario = this.fb.nonNullable.group({
    nombre: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100)
    ]],
    descripcion: ['', Validators.maxLength(500)]
  });

  categoriasFiltradas = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();

    return this.categorias().filter(categoria => {
      const coincideTexto = `${categoria.nombre} ${categoria.descripcion ?? ''}`
        .toLowerCase().includes(texto);

      const coincideEstado = this.estado() === 'TODAS' ||
        categoria.activo === (this.estado() === 'ACTIVAS');

      return coincideTexto && coincideEstado;
    });
  });

  nuevaCategoria(): void {
    this.categoriaEditada.set(null);
    this.formulario.reset();
    this.error.set('');
    this.mostrarFormulario.set(true);
  }

  editar(categoria: Categoria): void {
    this.categoriaEditada.set(categoria.id);
    this.formulario.reset({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion ?? ''
    });
    this.error.set('');
    this.mostrarFormulario.set(true);
  }

  enviar(): void {
    if (this.procesando()) return;

    this.error.set('');

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.error.set('Completa correctamente los datos de la categoría.');
      return;
    }

    const datos = this.formulario.getRawValue();
    const nombre = datos.nombre.trim();

    if (nombre.length < 3) {
      this.error.set('El nombre debe contener al menos tres caracteres.');
      return;
    }

    const duplicada = this.categorias().some(categoria =>
      categoria.id !== this.categoriaEditada() &&
      categoria.nombre.trim().toLowerCase() === nombre.toLowerCase()
    );

    if (duplicada) {
      this.error.set('Ya existe una categoría con ese nombre.');
      return;
    }

    this.guardar.emit({
      id: this.categoriaEditada(),
      datos: {
        nombre,
        descripcion: datos.descripcion.trim()
      }
    });
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.categoriaEditada.set(null);
    this.formulario.reset();
    this.error.set('');
  }

  limpiarFiltros(): void {
    this.busqueda.set('');
    this.estado.set('TODAS');
  }
}