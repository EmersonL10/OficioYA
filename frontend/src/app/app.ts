import { Component, inject, computed } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

import { Navbar } from './layout/navbar/navbar';
import { Footer } from './layout/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private router = inject(Router);

  private rutaActual = toSignal(
    this.router.events.pipe(
      filter(evento => evento instanceof NavigationEnd),
      map(evento => evento.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  esAdministrativo = computed(() => {
    const ruta = this.rutaActual().split(/[?#]/)[0];

    return ruta === '/admin' || ruta.startsWith('/admin/');
  });
}