import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../api/auth-service';
import { environment } from '../../../environment/environment'; 


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

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  async submit() {
    this.error = null;
    this.loading = true;

    try {
      // Guardamos credenciales (interceptor las meterá como Basic)
      this.auth.setCredentials(this.email.trim(), this.password);

      // “Ping” para validar credenciales (elige un endpoint protegido)
      // /categoria o /producto si ya lo tienes protegido
await this.http.get(`${environment.apiUrl}/producto`).toPromise();


      // OK -> entra
      this.router.navigateByUrl('/inicio');
    } catch (e: any) {
      // si falla, limpiamos token para que no se quede guardado
      this.auth.clear();
      this.error = 'Credenciales inválidas o tablet no autorizada';
    } finally {
      this.loading = false;
    }
  }
}
