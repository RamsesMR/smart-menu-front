/**
 * Configuración de Entorno
 * Centraliza las variables que cambian según es despliegue.
 * La propiedad {@link apiUrl} es el punto de referencia para:
 * 1. El {@link ApiClient} al construir las rutas de los
 * endpoints.
 * 2. El {@link authInterceptor} para validar a qué dominios
 * enviamos credenciales.
 */
export const environment = {
  production: true,
  apiUrl: 'http://localhost:9002',
};


//produccion

// export const environment = {
//   production: true,
//   apiUrl: 'http://lakritas.com:8080/app3_back',
// };

