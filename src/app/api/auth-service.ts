import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthResponse, User, Role } from '../models/auth.models';

/**
 * Servicio de Autenticación para SmartMenu.
 * * Versión de Desarrollo (MOCK): Sin conexión a Base de Datos.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'sm_token';
  private readonly USER_KEY = 'sm_user';

  constructor() {}

  /**
   * Recupera el token de acceso.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Recupera el objeto de usuario completo.
   * @returns El objeto {@link User} o null.
   */
  getUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
  }

  /**
   * Retorna el rol del usuario actual.
   */
  getRole(): Role | null {
    const user = this.getUser();
    return user ? user.role : null;
  }

  /**
   * Verifica existencia de credenciales.
   */
  hasCredentials(): boolean {
    return !!this.getToken();
  }

  /**
   * Simulacro de Login.
   */
  login(credentials: any): Observable<AuthResponse> {
    const mockResponse: AuthResponse = {
      token: 'fake-token-321',
      user: {
        id: '1',
        nombre: 'Maria',
        email: credentials.email,
        role: 'ADMIN',
      },
    };

    localStorage.setItem(this.TOKEN_KEY, mockResponse.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(mockResponse.user));

    return of(mockResponse);
  }

  /**
   * Cierra la sesión activa.
   */
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}
