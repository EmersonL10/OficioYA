import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-status',
  templateUrl: './status.html',
  styleUrl: './status.scss'
})
export class Status {
  estado = input.required<string>();

  etiqueta = computed(() =>
    this.estado().replace(/_/g, ' ')
  );
}