import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../environment/environment'; // El "GPS"
import { endpoints } from '../config/endpoints'; // El "Mapa"
import { AuthResponse } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'sm_token';
  private userKey = 'sm_user';

  private http = inject(HttpClient);

  constructor() { }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}${endpoints.auth.login}`, {
        email,
        password,
      })
      .pipe(
        tap((res) => {
          localStorage.setItem(this.tokenKey, res.token);
          localStorage.setItem(this.userKey, JSON.stringify(res.user));
        }),
      );
  }

  

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): any | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) : null;
  }

  getRole(): string | null {
    const user = this.getUser();
    return user ? user.rol : null;
  }

  clear() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  isLoggedIn() {
    return !!this.getToken();
  }
}

