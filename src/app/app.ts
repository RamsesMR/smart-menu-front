import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './components/nav-component/nav-component';
import { FooterComponent } from './components/footer-component/footer-component';
import { AuthService } from './api/auth-service';

/**
 * Componente principal de la aplicación SmartMenu.
 * Actúa como el contenedor raíz que contiene la navegación
 * y el área principal de visualización mediante {@link RouterOutlet}.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('smart-menu-front');

  constructor() {}
}
