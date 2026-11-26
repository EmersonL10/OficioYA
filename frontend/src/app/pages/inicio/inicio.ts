import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { Auth } from '../../core/services/auth';
import { CategoriaService } from '../../core/services/categoria';
import { ProfesionalService } from '../../core/services/profesional';

import {
  Categoria,
  Profesional
} from '../../core/models/api.models';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, FormsModule],
  styleUrl: './inicio.scss',
  templateUrl: './inicio.html',
})
export class Inicio implements OnInit {

  // Inyección de dependencias
  readonly auth = inject(Auth);

  private readonly categoriaService = inject(CategoriaService);
  private readonly profesionalService = inject(ProfesionalService);

  // Estado del componente
  readonly categorias = signal<Categoria[]>([]);
  readonly profesionales = signal<Profesional[]>([]);

  readonly cargando = signal(true);
  readonly error = signal('');

  // Filtros de búsqueda
  readonly busqueda = signal('');
  readonly categoriaSeleccionada = signal<number | null>(null);

  // Profesionales filtrados
  readonly profesionalesFiltrados = computed(() => {

    const termino = this.normalizar(this.busqueda());
    const categoriaId = this.categoriaSeleccionada();

    return this.profesionales().filter(profesional => {

      const contenido = this.normalizar(
        `${profesional.nombres} ${profesional.apellidos}
         ${profesional.categoriaNombre} ${profesional.descripcion}`
      );

      const coincideBusqueda = contenido.includes(termino);

      const coincideCategoria =
        categoriaId === null ||
        profesional.categoriaId === categoriaId;

      return coincideBusqueda && coincideCategoria;

    });
  });

  // Inicialización del componente
  ngOnInit(): void {
    this.cargarDatos();
  }

  // Consultar información del backend
  cargarDatos(): void {

    this.cargando.set(true);
    this.error.set('');

    forkJoin({
      categorias: this.categoriaService.listarActivas(),
      profesionales: this.profesionalService.listarDisponibles()
    }).subscribe({

      next: ({ categorias, profesionales }) => {

        this.categorias.set(categorias);
        this.profesionales.set(profesionales);
        this.cargando.set(false);

      },

      error: () => {

        this.error.set(
          'No se pudo cargar la información. Inténtalo nuevamente.'
        );

        this.cargando.set(false);

      }

    });
  }

  // Seleccionar una categoría
  seleccionarCategoria(categoriaId: number | null): void {
    this.categoriaSeleccionada.set(categoriaId);
  }

  // Restablecer los filtros
  limpiarFiltros(): void {
    this.busqueda.set('');
    this.categoriaSeleccionada.set(null);
  }

  // Normalizar texto para facilitar la búsqueda
  private normalizar(texto: string): string {

    return texto
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  }

}