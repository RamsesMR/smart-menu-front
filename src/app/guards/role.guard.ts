import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../api/auth-service';

/**
 * Guardián de seguridad basado en roles (RBAC - Role Based Access Control).
 * * @description Este guardián protege las rutas de la aplicación realizando una doble validación:
 * 1. **Autenticación**: Comprueba si el usuario tiene una sesión activa mediante {@link AuthService.isLoggedIn}.
 * 2. **Autorización**: Verifica si el rol del usuario coincide con los permisos definidos en la configuración de la ruta.
 * * @param route Instantánea de la ruta que se intenta activar, contiene la data de roles permitidos.
 * @returns `true` si el acceso es concedido, `false` si el usuario es redirigido por falta de permisos.
 * * @example
 * Uso en app.routes.ts:
 * { path: 'admin', component: AdminComponent, canActivate: [roleGuard], data: { roles: ['EMPRESA'] } }
 */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  //Si no hay credenciales, al login de cabeza
  if (!auth.isLoggedIn()) {
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
