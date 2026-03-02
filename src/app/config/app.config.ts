import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from '../app.routes';
import { authInterceptor } from '../http/auth.interceptor';

/**
 * Configuración global de la aplicación.
 * Se definen los proveedores principales que alimentan
 * SmartMenu.
 * 1. {@link routes} Activa el sistema de navegación
 * 2. HttpClient: Habilita las peticiones al servidor
 * 3. {@link authInterceptor} Asegura que cada petición
 * lleve el token de seguridad.
 */
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient(withInterceptors([authInterceptor]))],
};
