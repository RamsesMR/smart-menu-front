/**
 * Define los perfiles de acceso permitidos en la plataforma.
 * * - `CLIENTE`: Usuario que realiza pedidos desde la mesa.
 * - `EMPRESA`: Personal del restaurante (Admin, Barra, Cocina).
 */
export type Role = 'CLIENTE' | 'EMPRESA';

/**
 * Interfaz que representa la información del usuario en la sesión activa.
 */
export interface User {
  nombre: string;
  email: string;
  rol: Role;
  mesaId?: string;
}

/**
 * Estructura de la respuesta enviada por el backend tras una autenticación exitosa.
 * Contiene el token JWT necesario para el {@link AuthInterceptor}.
 */
export interface AuthResponse {
  token: string;
  user: User;
}
