import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../api/auth-service';

/**
 * Guardián de acceso baso en Roles.
 * Verifica autenticación (Si está logueado)
 * Verifica autorización (Si tiene el rol adecuado)
 */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  //Si no hay credenciales, al login de cabeza
  if (!auth.hasCredentials()) {
    router.navigateByUrl('/login');
    return false;
  }

  /** Obtener roles permitidos definidos en las rutas.
   * Si la ruta no define roles, se permite el paso.
   */
  const rolesPermitidos = route.data['roles'] as string[];
  if (!rolesPermitidos) return true;

  /** Comprobado el rol del usuario actual */
  const userRole = auth.getRole();

  if (userRole && rolesPermitidos.includes(userRole)) {
    return true;
  }

  /** Si tiene sesión pero no el rol necesario, se va a inicio */
  console.warn(`Acceso denegado para el rol: ${userRole}`);
  router.navigateByUrl('/inicio');
  return false;
};
