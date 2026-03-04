import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client';
import { endpoints } from '../config/endpoints';

export interface LineaPedido {
  productoId: string;
  nombreActual: string;
  precioActual: number;
  cantidad: number;
  nota?: string;
}

export interface NuevoPedido {
  mesaId: string;
  nota: string;
  lineasPedido: LineaPedido[];
  totalPedido: number;
  fechaCreacion: string;
}

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

@Injectable({ providedIn: 'root' })
export class PedidoService {
  constructor(private api: ApiClient) {}

  crearPedido(pedido: NuevoPedido): Observable<any> {
    return this.api.post(endpoints.orders.create, pedido);
  }

  obtenerPedidos(): Observable<PedidoBackend[]> {
    return this.api.get<PedidoBackend[]>(endpoints.orders.list);
  }

  actualizarEstadoPedido(id: string, nuevoEstado: string): Observable<any> {
    return this.api.patch(`${endpoints.orders.list}/${id}/estado`, { estado: nuevoEstado });
  }
}