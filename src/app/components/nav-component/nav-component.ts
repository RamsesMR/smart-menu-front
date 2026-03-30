import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../api/auth-service';

/**
 * Componente de navegación principal (Navbar).
 * * @description Renderiza una barra de navegación persistente, generalmente ubicada
 * en la parte inferior (Mobile-first) o superior de la interfaz.
 * Gestiona la visibilidad de los enlaces basándose en el rol del usuario autenticado.
 * * Utiliza {@link RouterModule} para la navegación SPA (Single Page Application)
 * y {@link CommonModule} para directivas estructurales como `*ngIf`.
 */
@Component({
  selector: 'app-nav-component',
  imports: [RouterModule, CommonModule],
  templateUrl: './nav-component.html',
  styleUrl: './nav-component.css',
})
export class NavComponent {
  public auth = inject(AuthService);

  /**
   * Determina si el usuario actual pertenece al staff del establecimiento.
   * * @returns `true` si el rol es 'EMPLEADO' o 'EMPRESA', permitiendo el acceso
   * a vistas de gestión de pedidos y administración.
   */
  get esPersonal(): boolean {
    const role = this.auth.getRole();
    return role === 'EMPLEADO' || role === 'EMPRESA';
  }

  /**
   * Obtiene la etiqueta del rol del usuario para lógica de plantillas o depuración.
   * @returns El string del rol almacenado en el token de sesión o un string vacío si no hay sesión.
   */
  get userRole(): string {
    return this.auth.getRole() ?? '';
  }
}
