import { Component, effect, input, output } from '@angular/core';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.html',
  styleUrl: './notification.scss'
})
export class Notification {
  mensaje = input.required<string>();
  tipo = input<'error' | 'success' | 'info'>('info');
  cerrar = output<void>();

  constructor() {
    effect((onCleanup) => {
      if (!this.mensaje() || this.tipo() === 'error') return;

      const temporizador = setTimeout(() => {
        this.cerrar.emit();
      }, 5000);

      onCleanup(() => clearTimeout(temporizador));
    });
  }
}