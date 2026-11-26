import { Component, ElementRef, input, output, viewChild } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss'
})
export class ConfirmDialog {
  titulo = input('Confirmar operación');
  mensaje = input.required<string>();

  confirmar = output<void>();
  cancelar = output<void>();

  private dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  abrir(): void {
    this.dialogo().nativeElement.showModal();
  }

  cerrar(): void {
    this.dialogo().nativeElement.close();
    this.cancelar.emit();
  }

  aceptar(): void {
    this.dialogo().nativeElement.close();
    this.confirmar.emit();
  }
}