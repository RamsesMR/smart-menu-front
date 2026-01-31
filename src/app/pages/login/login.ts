import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../api/auth-service';

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
