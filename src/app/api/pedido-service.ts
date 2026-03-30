import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client';
import { endpoints } from '../config/endpoints';

/**
 * Representa una línea individual de producto dentro de un pedido.
 * Incluye una "foto" de los datos del producto en el momento de la compra
 * para evitar cambios si el menú se actualiza después.
 */
export interface LineaPedido {
  productoId: string;
  nombreActual: string;
  precioActual: number;
  cantidad: number;
  nota?: string;
}

/**
 * Objeto de transferencia (DTO) para la creación de un nuevo pedido.
 * Reúne la información necesaria para que el backend procese la comanda.
 */
export interface NuevoPedido {
  mesaId: string;
  nota: string;
  lineasPedido: LineaPedido[];
  totalPedido: number;
  fechaCreacion: string;
}

/**
 * Estructura del pedido tal como se recibe desde el backend.
 * Incluye metadatos de control y seguimiento de la cocina.
 */
export interface PedidoBackend {
  id?: string;
  _id?: string;
  mesaId: string;
  estado: string;
  codigo?: string;
  nota: string;
  lineasPedido: LineaPedido[];
  totalPedido: number;
  fechaCreacion: string;
}

/**
 * Servicio encargado de la gestión de pedidos y comunicación con la API de cocina.
 * * @description Permite crear comandas, listar pedidos existentes y actualizar sus estados.
 * Utiliza {@link ApiClient} para todas las operaciones de red.
 */
@Injectable({ providedIn: 'root' })
export class PedidoService {
  constructor(private api: ApiClient) {}

  /**
   * Envía un nuevo pedido al servidor para su procesamiento en cocina.
   * @param pedido Objeto con los datos de la comanda y líneas de producto.
   * @returns Un Observable con la respuesta de confirmación del servidor.
   */
  crearPedido(pedido: NuevoPedido): Observable<any> {
    return this.api.post(endpoints.orders.create, pedido);
  }

  /**
   * Recupera el listado completo de pedidos registrados en el sistema.
   * @returns Un Observable que contiene un array de objetos de tipo {@link PedidoBackend}.
   */
  obtenerPedidos(): Observable<PedidoBackend[]> {
    return this.api.get<PedidoBackend[]>(endpoints.orders.list);
  }

  /**
   * Modifica el estado de un pedido específico (ej: de 'RECIBIDO' a 'PREPARANDO').
   * @param id Identificador único del pedido a actualizar.
   * @param nuevoEstado El nuevo valor del estado de la comanda.
   * @returns Un Observable con el resultado de la operación PATCH.
   */
  actualizarEstadoPedido(id: string, nuevoEstado: string): Observable<any> {
    return this.api.patch(`${endpoints.orders.list}/${id}/estado`, { estado: nuevoEstado });
  }
}
