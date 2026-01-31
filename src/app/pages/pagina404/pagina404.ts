import { Component } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Componente para gestionar errores de rutas no encontradas.
 */
@Component({
  selector: 'app-pagina404',
  standalone: true,
  templateUrl: './pagina404.html',
  styleUrl: './pagina404.css',
})
export class Pagina404 {
  constructor(private router: Router) {}

  /**
   * Redirige al usuario a la pantalla de inicio.
   */
  volverAlInicio() {
    this.router.navigate(['/inicio']);
  }
}
