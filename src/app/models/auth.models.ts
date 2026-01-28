/** Roles de usuario permitidos en el sistema */
export type Role = 'CLIENTE' | 'BARRA' | 'CAMARERO' | 'ADMIN';

/** Representación del usuario autenticado */
export interface User {
  id: string;
  nombre: string;
  email: string;
  role: Role;
  mesaId?: string;
}

/** Respuesta exitosa del servidor tras el login */
export interface AuthResponse {
  token: string;
  user: User;
}
