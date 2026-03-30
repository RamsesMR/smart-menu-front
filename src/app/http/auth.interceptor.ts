import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../api/auth-service';
import { environment } from '../../environment/environment';

/**
 * Interceptor funcional para la gestión de la autenticación JWT.
 * * @description Actúa como un middleware para todas las peticiones HTTP salientes. 
 * Su función principal es adjuntar el token de acceso al encabezado `Authorization` 
 * utilizando el esquema `Bearer`.
 * * Se integra automáticamente en el flujo de {@link HttpClient} mediante la 
 * configuración de proveedores de la aplicación.
 * * @param req La petición saliente original.
 * @param next El siguiente manejador en la cadena de interceptores.
 * @returns Un flujo de eventos HTTP con la petición (posiblemente) modificada.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();
  console.log('url: ', req.url);
  console.log('hay token?', token ? 'SI' : 'NO');
  if (token) console.log('Token', token?.substring(0, 15) + '...');

  /** * Verificación de seguridad básica. 
   * Si no existe un token en el {@link AuthService}, la petición continúa 
   * su curso original sin cabeceras de autorización (útil para Login o Registro).
   */
  if (!token) return next(req);

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
