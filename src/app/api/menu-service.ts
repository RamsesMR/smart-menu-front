import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client';
import { endpoints } from '../config/endpoints';
import type { MenuResponse, Producto } from '../models/menu.models';
import { map, Observable, of } from 'rxjs';

/**
 * Servicio de Negocio para la Gestión del Menú
 * Este servicio expone métodos para gestionar el
 * catálogo del restaurante. Usa {@link ApiClient}
 * para la comunicación y tipa las respuestas con
 * la interfaz {@link Producto}.
 */
@Injectable({ providedIn: 'root' })
export class MenuService {
  /**
   *
   * @param api Cliente de API para realizar peticiones HTTP.
   */

  private api = inject(ApiClient);
  /**
   * Recupera la lista completa de productos del servidor.
   * El backend debe devolver un array de objetos que coincida con
   * la estructura de la interfaz Producto.
   * @returns Un Observable que emite un array de {@link Producto}
   */

  /**
   * Remover comentario cuando conectado con API
   * getMenu() {
    return this.api.get<Producto[]>(endpoints.productos.list);
  }
  */
  getMenu(): Observable<MenuResponse> {
  return this.api.get<any>(endpoints.productos.list).pipe(
    map((resp) => {
      const listaRaw = Array.isArray(resp) ? resp : resp.productos || [];

      return {
        productos: listaRaw.map((p: any) => ({
          ...p,
          id: p.id,
        })),
      };
    }),
  );
}
}