import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client';
import { ItemCarrito } from '../state/pedido.store';

/**
 * Interfaz que define la estructura para registrar una nueva comanda.
 * Se utiliza exclusivamente en el proceso de creación desde la mesa.
 */
export interface NuevoPedido {
  /** Estado inicial del pedido */
  estadoPedido: string;
  /** Comentarios adicionales del cliente */
  nota: string;
  /** Listado de productos extraídos del {@link PedidoStore} */
  items: ItemCarrito[];
  /** Importe total de la transacción */
  total: number;
  /** TImestamp de la operación */
  fechaCreacion: string;
  /** Identificador de la mesa física */
  mesa: string;
}

/** Estructura de datos de un pedido retornado por la base de datos.
 * Soporta identificadores tanto de SQL (id) como de NoSQL(_id).
 */
export interface PedidoBackend {
  id?: string;
  _id?: string;
  estadoPedido: string;
  nota: string;
  items: any[];
  total: number;
  fechaCreacion: string;
  mesa: string;
}

/**
 * Servicio de gestión de pedidos
 * Este servicio está orientado al panel de administración y barra.
 * Se encarga de la visualización global y el control de estados
 * de los pedidos.
 */
@Injectable({ providedIn: 'root' })
export class PedidoService {
  /**
   *
   * @param api Cliente de comunicación centralizado {@link ApiClient}
   */
  constructor(private api: ApiClient) {}

  /**
   * Registra un nuevo pedido en el sistema.
   * @param pedido Objeto con la información de la comanda.
   * @returns Observable con la respuesta del servidor.
   * @endpoint POST /pedido
   */
  crearPedido(pedido: NuevoPedido): Observable<any> {
    return this.api.post('/pedido', pedido);
  }

  /**
   * Recupera el listado completo de pedidos para el
   * monitor de cocina//barra.
   * @returns Un flujo de datos con todos los pedidos
   * en formato {@link PedidoBackend}
   * @endpoint GET /pedido
   */
  obtenerPedidos(): Observable<PedidoBackend[]> {
    return this.api.get<PedidoBackend[]>('/pedido');
  }

  /**
   * Actualiza un pedido existente.
   * @param pedido El objeto completo del pedido con las modificaciones.
   * @returns PUT /pedido/
   */
  actualizarPedido(pedido: PedidoBackend): Observable<any> {
    return this.api.put('/pedido/', pedido);
  }

  actualizarEstadoPedido(id: string, nuevoEstado: string): Observable<any> {
    return this.api.put(`/pedido/${id}/estado`, { estadoPedido: nuevoEstado });
  }
}
