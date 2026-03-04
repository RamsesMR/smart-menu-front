import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../api/auth-service';

/**
 * Componente de navegación principal.
 * Barra de navegación persistente en la parte inferior
 * de la pantalla.
 * Usa {@link RouterModule} para gestionar cambio de vistas
 * sin recargar la página.
 */
@Component({
  selector: 'app-nav-component',
  imports: [RouterModule, CommonModule],
  templateUrl: './nav-component.html',
  styleUrl: './nav-component.css',
})
export class NavComponent {
  public auth = inject(AuthService);

  get esPersonal(): boolean {
    const role = this.auth.getRole();
    return role === 'EMPLEADO' || role === 'EMPRESA';
  }

  get userRole(): string {
    return this.auth.getRole() ?? '';
  }
}
