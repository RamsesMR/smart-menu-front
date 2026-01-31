export type Role = 'EMPRESA' | 'CLIENTE';

export interface User {
  nombre: string;
  rol: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}
