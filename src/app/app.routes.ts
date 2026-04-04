import { Routes } from '@angular/router';
import { roleGuard } from './guards/role.guard';
import { Pagina404 } from './pages/pagina404/pagina404';

/**
 * Configuración de enrutado principal de SmartMenu.
 * Define la corresondencia entre las URLs del navegador
 * y los componentes. Utiliza 'lazy loading' para optimizar
 * rendimiento.
 */
export const routes: Routes = [
  /** Ruta de acceso inicial y autenticación */
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },

  /** Vista principal tras el acceso */
  {
    path: 'inicio',
    canActivate: [roleGuard],
    data: { roles: ['CLIENTE', 'EMPRESA', 'EMPLEADO'] },
    loadComponent: () => import('./pages/inicio/inicio').then((m) => m.Inicio),
  },

  /** Catálogo de productos (carta digital) */
  {
    path: 'menu',
    canActivate: [roleGuard],
    data: { roles: ['CLIENTE', 'EMPRESA', 'EMPLEADO'] },
    loadComponent: () => import('./pages/menu/menu').then((m) => m.Menu),
  },

  /** Flujo de creación de pedido y carrito */
  {
    path: 'pedir',
    canActivate: [roleGuard],
    data: { roles: ['CLIENTE', 'EMPRESA', 'EMPLEADO'] },
    loadComponent: () => import('./pages/pedir/pedir').then((m) => m.Pedir),
  },

  /** Panel de gestión para personal de restaurante */
  {
    path: 'barra',
    canActivate: [roleGuard],
    data: { roles: ['EMPRESA', 'EMPLEADO'] },
    loadComponent: () => import('./pages/barra/barra').then((m) => m.Barra),
  },

  /** Pantalla del formulario IA */
  {
    path: 'formulario-ia',
    canActivate: [roleGuard],
    data: { roles: ['CLIENTE', 'EMPRESA', 'EMPLEADO'] },
    loadComponent: () => import('./pages/formulario-ia/formulario-ia').then((m) => m.FormularioIa),
  },

  {
    path: 'admin',
    canActivate: [roleGuard],
    data: { roles: ['EMPRESA'] },
    loadComponent: () => import('./pages/admin/admin').then((m) => m.Admin),
  },

  /** Redirección por defecto al entrar en la raíz */
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  /** Manejo de errores y rutas no encontradas */
  { path: '404', component: Pagina404 },
  { path: '**', redirectTo: '404' },
];
