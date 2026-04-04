import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../api/auth-service';

/** Componente de control de acceso.
 * Gestiona la captura de las credenciales del usuario
 * y el flujo de autenticación inicial.
 * Permite que el {@link roleGuard} gestione los
 * permisos según el rol.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  email = '';
  password = '';
  loading = false;
  error: string | null = null;

  /**
   *
   * @param auth Servicio para la gestión de identidad {@link AuthService}
   * @param router Servicio de navegación de Angular
   */
  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}
  /**
   * Procesa el envío del formulario de acceso.
   */
  submit() {
    this.error = null;
    this.loading = true;

  this.auth.login(this.email.trim(), this.password).subscribe({
    next: () => {
      this.router.navigateByUrl('/inicio');
      this.loading = false;
    },
    error: () => {
      this.auth.clear();
      this.error = 'Credenciales inválidas';
      this.loading = false;
    }
  });
}
}
