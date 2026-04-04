/** Roles de usuario permitidos en el sistema */
export type Role = 'CLIENTE' | 'EMPRESA';

/** Representación del usuario autenticado */
export interface User {
  nombre: string;
  email: string;
  rol: Role;
  mesaId?: string;
}

/** Respuesta exitosa del servidor tras el login */
export interface AuthResponse {
  token: string;
  user: User;
}
