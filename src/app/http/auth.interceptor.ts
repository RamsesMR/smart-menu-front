import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../api/auth-service';
import { environment } from '../../environment/environment';

/**
 * Captura todas las peticiones HTTP salientes.
 * Si existe token válido en {@link AuthService},
 * lo inyecta en las cabeceras.
 * @param req La petición HTTP saliente.
 * @param next El siguiente manejador en la cadena de interceptores
 * @returns Un flujo de evento HTTP con la petición.
 * @example
 * Si el token es 'abc', añade la cabecera:
 * Authorization: Basic abc
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  //Si no hay token, la petición continua su curso normal.
  if (!token) return next(req);

  /**
   * FILTRO DE SEGURIDAD POR URL:
   * Solo inyectamos credenciales si la petición va dirigida
   * a nuestro servidor API. Evita enviar contraseñas a
   * servicios externos.
   * @important Esta URL debe coincidir con la del
   * backend en producción.
   */
  if (!req.url.startsWith(environment.apiUrl)) return next(req);

  // Clon de la petición original y añadida a la cabecera de Auth.
  return next(
    req.clone({
      setHeaders: { Authorization: `Basic ${token}` },
    }),
  );
};
