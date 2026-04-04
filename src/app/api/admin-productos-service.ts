import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client';
import { endpoints } from '../config/endpoints';

export type AdminProducto = {
  id?: string;
  _id?: string;

  nombre: string;
  descripcion: string;
  precio: number;
  tipoIva: number;

  // calculados por backend (no obligatorios al enviar)
  importeIva?: number;
  precioConIva?: number;

  imagen?: string;
  disponible: boolean;

  tags?: string[];
  alergenos?: string[];
  kcal?: number;

  restauranteId?: string;
  categoriaId?: string;

  proteinas?: number;
  grasas?: number;
  carbohidratos?: number;
};

@Injectable({ providedIn: 'root' })
export class AdminProductosService {
  private api = inject(ApiClient);

  listar(): Observable<any> {
    return this.api.get(endpoints.productos.list);
  }

  crear(body: AdminProducto): Observable<any> {
    return this.api.post(endpoints.productos.list, body);
  }

  actualizar(id: string, body: AdminProducto): Observable<any> {
    return this.api.put(endpoints.productos.one(id), body);
  }

  eliminar(id: string): Observable<any> {
    return this.api.delete(endpoints.productos.one(id));
  }
}