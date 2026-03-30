import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';

/**
 * Servicio centralizado para la comunicación HTTP.
 * * @description Esta clase actúa como un envoltorio (Wrapper) sobre {@link HttpClient}.
 * Su objetivo es centralizar la lógica de construcción de URLs, asegurar la consistencia
 * de las peticiones y facilitar el mantenimiento de los endpoints en toda la aplicación.
 */

@Injectable({ providedIn: 'root' })
export class ApiClient {
  /**
   * Inicializa el cliente API.
   * @param http Cliente nativo de Angular para realizar peticiones.
   */
  constructor(private http: HttpClient) {}
  /**
   * Construye una URL completa combinando la base del entorno con el recurso solicitado.
   * * @private
   * @param path Ruta relativa del endpoint (ej: 'productos' o '/pedidos').
   * @returns La URL normalizada lista para ser consumida.
   * * @example
   * Si environment.apiUrl es 'http://api.com/'
   * this.join('menu'); // devuelve 'http://api.com/menu'
   */
  private join(path: string) {
    const base = environment.apiUrl.replace(/\/+$/, '');
    const p = path.startsWith('/') ? path : `/${path}`;
    return base + p;
  }

  /**
   * Ejecuta una petición HTTP de tipo GET para recuperar información.
   * * @template T Tipo de dato o interfaz esperado en la respuesta.
   * @param path Ruta relativa del recurso.
   * @returns Un `Observable` que emitirá la respuesta de tipo T.
   * * @example
   * ```typescript
   * this.apiClient.get<Producto[]>('productos').subscribe(data => ...);
   * ```
   */
  get<T>(path: string) {
    return this.http.get<T>(this.join(path));
  }

  /**
   * Ejecuta una petición HTTP de tipo POST para crear un nuevo recurso.
   * * @template T Tipo de dato esperado como respuesta del servidor.
   * @param path Ruta relativa del recurso.
   * @param body Objeto con los datos a enviar en el cuerpo de la petición.
   * @returns Un `Observable` con el resultado de la operación.
   */
  post<T>(path: string, body: any) {
    return this.http.post<T>(this.join(path), body);
  }

  /**
   * Ejecuta una petición HTTP de tipo PUT para reemplazar o actualizar un recurso.
   * * @template T Tipo de dato esperado como respuesta.
   * @param path Ruta relativa del recurso.
   * @param body Datos actualizados para el servidor.
   * @returns Un `Observable` con el resultado de la actualización.
   */
  put<T>(path: string, body: any) {
    return this.http.put<T>(this.join(path), body);
  }

  /**
   * Ejecuta una petición HTTP de tipo DELETE para eliminar un recurso del servidor.
   * * @template T Tipo de dato esperado (usualmente un mensaje de confirmación o void).
   * @param path Ruta relativa del recurso a eliminar.
   * @returns Un `Observable` que confirma la eliminación.
   */
  delete<T>(path: string) {
    return this.http.delete<T>(this.join(path));
  }

  /**
   * Ejecuta una petición HTTP de tipo PATCH para actualizar parcialmente un recurso.
   * * @template T Tipo de dato esperado como respuesta.
   * @param path Ruta relativa del recurso.
   * @param body Campos específicos a modificar.
   * @returns Un `Observable` con el resultado de la modificación parcial.
   */
  patch<T>(path: string, body: any) {
    return this.http.patch<T>(this.join(path), body);
  }
}
