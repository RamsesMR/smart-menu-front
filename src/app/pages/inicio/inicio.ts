import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

/**
 * Pantalla de bienvenida principal.
 * Permite al usuario elegir entre ver la carta, realizar un pedido o llamar al servicio.
 */
@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  /** Controla la visibilidad del modal para llamar al camarero. */
  callModalOpen = false;
  /** Signal que gestiona el mensaje mostrado en la notificación temporal (toast). */
  toastMsg = signal('');

  constructor(private router: Router) {}

  /**
   * Navega hacia la vista de la carta en modo lectura.
   */
  goToMenu() {
    this.router.navigate(['/menu'], { queryParams: { modo: 'ver' } });
  }

  /**
   * Navega hacia la vista de la carta en modo selección de productos.
   */
  goToBuild() {
    this.router.navigate(['/menu'], { queryParams: { modo: 'armar' } });
  }

  /**
   * Muestra el modal de solicitud de asistencia.
   */
  openCallService() {
    this.callModalOpen = true;
  }

  /**
   * Oculta el modal de solicitud de asistencia sin realizar acciones.
   */
  closeCallService() {
    this.callModalOpen = false;
  }

  /**
   * Confirma la solicitud de servicio y muestra una notificación al usuario.
   */
  async confirmCallService() {
    this.callModalOpen = false;
    this.showToast('Aviso enviado.');
  }

  /**
   * Gestiona la visualización temporal de un mensaje de notificación.
   * @param msg Texto a mostrar en la notificación.
   */
  private showToast(msg: string) {
    this.toastMsg.set(msg);
    setTimeout(() => {
      this.toastMsg.set('');
    }, 3000);
  }
}
