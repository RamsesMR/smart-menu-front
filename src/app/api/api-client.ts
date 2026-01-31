import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';

/**
 * SERVICIO CENTRAL DE COMUNICACIÓN
 * Punto de contacto directo con el servidor. Centraliza las
 * peticiones HTTP para asegurar que la URL base y los headers
 * sean consistentes en toda la app.
 */

@Injectable({ providedIn: 'root' })
export class ApiClient {
  constructor(private http: HttpClient) {}
  /**
   * Une la URL base del entorno con el path del recurso.
   * @param path Ruta del endpoint (ej. 'pedidos' o '/productos')
   * @returns La URL completa y normalizada.
   */
  private join(path: string) {
    const base = environment.apiUrl.replace(/\/+$/, '');
    const p = path.startsWith('/') ? path : `/${path}`;
    return base + p;
  }
  /**
   * Métodos GET, POST, PUT, DELETE
   */
  /**
   * Realiza una petición de tipo GET para recuperar recursos.
   * * @example
   * ```typescript
   * this.apiClient.get<Producto[]>('productos').subscribe(...)
   * ```
   * * @template T Tipo de dato esperado en la respuesta.
   * @param path Ruta relativa del endpoint.
   * @returns Un Observable con el cuerpo de la respuesta en tipo T.
   */
  get<T>(path: string) {
    return this.http.get<T>(this.join(path));
  }

  /**
   * Realiza una petición de tipo POST para crear nuevos recursos.
   * * @template T Tipo de dato esperado en la respuesta.
   * @param path Ruta relativa del endpoint.
   * @param body Objeto con los datos a enviar al servidor.
   * @returns Un Observable con el resultado de la operación.
   */
  post<T>(path: string, body: any) {
    return this.http.post<T>(this.join(path), body);
  }

  /**
   * Realiza una petición de tipo PUT para actualizar recursos existentes.
   * * @template T Tipo de dato esperado en la respuesta.
   * @param path Ruta relativa del endpoint.
   * @param body Objeto con los datos actualizados.
   * @returns Un Observable con el resultado de la actualización.
   */
  put<T>(path: string, body: any) {
    return this.http.put<T>(this.join(path), body);
  }

  /**
   * Realiza una petición de tipo DELETE para eliminar un recurso.
   * * @template T Tipo de dato esperado en la respuesta.
   * @param path Ruta relativa del endpoint.
   * @returns Un Observable que confirma la eliminación.
   */
  delete<T>(path: string) {
    return this.http.delete<T>(this.join(path));
  }
}
