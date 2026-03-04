import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto.model';
import { environment } from '../../environment/environment'; // Importamos el environment

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private readonly API_URL = `${environment.apiUrl}/producto`;

  private http = inject(HttpClient);

  /**
   * Obtiene la lista completa de platos desde MongoDB
   */
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.API_URL);
  }

  /**
   * Obtiene un producto por su ID
   */
  getProductoById(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.API_URL}/${id}`);
  }

  /**
   * Crea un nuevo plato (Solo para rol EMPRESA)
   */
  createProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.API_URL, producto);
  }

  /**
   * Actualiza stock o datos de un plato
   */
  updateProducto(id: string, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.API_URL}/${id}`, producto);
  }

  /**
   * Elimina un plato de la carta
   */
  deleteProducto(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
