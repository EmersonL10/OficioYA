import { Component, input, output } from '@angular/core';

export interface MenuItem {
  id: string;
  nombre: string;
}

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.scss'
})
export class DashboardLayout {
  titulo = input.required<string>();
  nombre = input.required<string>();
  correo = input.required<string>();
  menu = input.required<MenuItem[]>();
  seccion = input.required<string>();

  seleccionar = output<string>();
}