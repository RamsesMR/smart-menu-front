import { Routes } from '@angular/router';
import { authGuard } from './guards/role.guard'; // si tu guard ya valida "logueado"
import { Pagina404 } from './pages/pagina404/pagina404';

export const routes: Routes = [

  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
  },

  {
    path: 'inicio',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/inicio/inicio').then(m => m.Inicio),
  },
  {
    path: 'menu',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/menu/menu').then(m => m.Menu),
  },
  {
    path: 'pedir',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/pedir/pedir').then(m => m.Pedir),
  },
  { path: 'barra', loadComponent: () => import('./pages/barra/barra').then(m => m.Barra) },

  { path: '', pathMatch: 'full', redirectTo: 'login' },

  { path: '404', component: Pagina404 },
  { path: '**', redirectTo: '404' },
];
