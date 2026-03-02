import { Injectable } from '@angular/core';
import { ApiClient } from './api-client';
import { endpoints } from '../config/endpoints';
import type { CreateOrderRequest, OrderResponse } from '../models/order.models';

/**
 * Servicio para la gestión de pedidos desde el Cliente.
 * Maneja las operaciones de creación y consulta de historial
 * personal del comensal en la mesa.
 */
@Injectable({ providedIn: 'root' })
export class OrdersService {
  constructor(private api: ApiClient) {}

  /**
   * Envía una nueva comanda al sistema.
   * @param body Datos de la orden(items, mesa, total)
   * @endpoint POST /pedidos (Plural)
   */
  createOrder(body: CreateOrderRequest) {
    return this.api.post<OrderResponse>(endpoints.orders.create, body);
  }

  /**
   * Recupera el historial de pedidos del cliente actual.
   * @endpoint GET /pedidos/mios
   */
  myOrders() {
    return this.api.get<OrderResponse[]>(endpoints.orders.myOrders);
  }
}
