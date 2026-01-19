import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client';
import { ItemCarrito } from '../state/pedido.sotore';

export interface NuevoPedido {
  estadoPedido: string;
  nota: string;
  items: ItemCarrito[];   // ahora encaja con lo que vamos a montar
  total: number;
  fechaCreacion: string;
  mesa: string;
}

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


@Injectable({ providedIn: 'root' })
export class PedidoService {
  constructor(private api: ApiClient) {}

  crearPedido(pedido: NuevoPedido): Observable<any> {
  
    return this.api.post('/pedido', pedido);
  }


  obtenerPedidos(): Observable<PedidoBackend[]> {

    return this.api.get<PedidoBackend[]>('/pedido');
 
  }


  actualizarPedido(pedido: PedidoBackend): Observable<any> {
   
    return this.api.put('/pedido/', pedido);

  }
}
