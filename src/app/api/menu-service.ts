import { Injectable } from '@angular/core';
import { ApiClient } from './api-client';
import { endpoints } from '../config/endpoints';
import type { MenuResponse, Producto } from '../models/menu.models';
import { Observable, of } from 'rxjs';

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

  /** Remover comentario cuando conectado con API
   * constructor(private api: ApiClient) {}
   */
  constructor() {}
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
    const mockProductos: Producto[] = [
      {
        id: '1',
        nombre: 'Tequeños de Queso',
        descripcion: '5 palitos de queso crujientes con salsa de frambuesa.',
        precio: 8.0,
        tipoIva: 10,
        importeIva: 0.8,
        precioConIva: 8.8,
        categoria: 'Entrantes',
        kcal: 450,
        imagen: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=500',
        disponible: true,
      },
      {
        id: '2',
        nombre: 'Hamburguesa Triple Queso',
        descripcion: 'Tres niveles de carne con cheddar fundido.',
        precio: 12.0,
        tipoIva: 10,
        importeIva: 1.2,
        precioConIva: 13.2,
        categoria: 'Principales',
        kcal: 850,
        imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
        disponible: true,
      },
      {
        id: '3',
        nombre: 'Cerveza Artesana',
        descripcion: 'Lager fresquita de barril.',
        precio: 3.5,
        tipoIva: 21,
        importeIva: 0.74,
        precioConIva: 4.24,
        categoria: 'Bebidas',
        kcal: 150,
        imagen: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=500',
        disponible: true,
      },
      {
        id: '4',
        nombre: 'Coulant de Chocolate',
        descripcion: 'Corazón fundido con helado de vainilla.',
        precio: 6.0,
        tipoIva: 10,
        importeIva: 0.6,
        precioConIva: 6.6,
        categoria: 'Postres',
        kcal: 600,
        imagen: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500',
        disponible: true,
      },
    ];

    return of({ productos: mockProductos });
  }
}
