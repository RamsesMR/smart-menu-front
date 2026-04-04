import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavComponent } from './components/nav-component/nav-component';
import { FooterComponent } from './components/footer-component/footer-component';
import { AuthService } from './api/auth-service';
import { CommonModule } from '@angular/common';
import { ServiceCallService } from './api/service-call-service';

/**
 * Componente principal de la aplicación SmartMenu.
 * Actúa como el contenedor raíz que contiene la navegación
 * y el área principal de visualización mediante {@link RouterOutlet}.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  public auth = inject(AuthService);
  private serviceCall = inject(ServiceCallService);
  private router = inject(Router);

  protected readonly title = signal('smart-menu-front');

  callModalOpen = signal(false);
  toastMsg = signal('');

  openCallService() {
    this.callModalOpen.set(true);
  }

  closeCallService() {
    this.callModalOpen.set(false);
  }

  confirmCallService() {
    const mesaId = new URLSearchParams(window.location.search).get('mesa') || 'Mesa Local';

    this.serviceCall.callWaiter({ mesaId }).subscribe({
      next: () => {
        this.closeCallService();
        this.showToast('Aviso enviado. Nuestro personal vendrá pronto.');
      },
      error: (err) => {
        console.error('Error al llamar:', err);
        this.showToast('No se pudo enviar el aviso.');
      },
    });
  }

  private showToast(msg: string) {
    this.toastMsg.set(msg);
    setTimeout(() => this.toastMsg.set(''), 3000);
  }
}

