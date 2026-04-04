import { Injectable } from '@angular/core';

export type ItemCarrito = {
  productoId: string;
  nombreActual: string;
  precioActual: number;
  cantidad: number;
  nota?: string;
  kcal?: number;
  enviado?: boolean;
};

@Injectable({ providedIn: 'root' })
export class PedidoStore {
  private clave = 'sm_carrito';
  private claveMesa = 'sm_mesa';
  private claveId = 'sm_pedido_id';
  private claveHistorial = 'sm_historial_pedidos';
  private estadoPedido = localStorage.getItem('estado_actual') || 'NUEVO';

  guardarMesa(mesa: string): void {
    localStorage.setItem(this.claveMesa, mesa || '');
  }

  obtenerMesa(): string {
    return localStorage.getItem(this.claveMesa) || '';
  }

  guardarIdPedido(id: string): void {
    localStorage.setItem(this.claveId, id);
  }

  obtenerIdPedido(): string {
    let id = localStorage.getItem(this.claveId);

    if (!id) {
      id = 'ped' + Math.random().toString(36).substring(2, 11);
      this.guardarIdPedido(id);
    }

    return id;
  }

  guardarEstado(nuevoEstado: string): void {
    this.estadoPedido = nuevoEstado;
    localStorage.setItem('estado_actual', nuevoEstado);
  }

  obtenerEstado(): string {
    return localStorage.getItem('estado_actual') || this.estadoPedido;
  }

  obtenerHistorial(): any[] {
    try {
      return JSON.parse(localStorage.getItem(this.claveHistorial) || '[]');
    } catch {
      return [];
    }
  }

  agregarAlHistorial(comanda: any): void {
    const historial = this.obtenerHistorial();
    historial.push(comanda);
    localStorage.setItem(this.claveHistorial, JSON.stringify(historial));
  }

  obtenerItems(): ItemCarrito[] {
    try {
      return JSON.parse(localStorage.getItem(this.clave) || '[]');
    } catch {
      return [];
    }
  }

  guardarItems(items: ItemCarrito[]): void {
    localStorage.setItem(this.clave, JSON.stringify(items || []));
  }

  vaciar(): void {
    localStorage.removeItem(this.clave);
    localStorage.removeItem(this.claveMesa);
    localStorage.removeItem(this.claveId);
    localStorage.removeItem(this.claveHistorial);
    localStorage.removeItem('estado_actual');
    localStorage.removeItem('mock_estados_pedidos');
    localStorage.removeItem('ultimo_estado_pedido');
  }

  totalItems(): number {
    return this.obtenerItems().reduce((a, i) => a + Number(i.cantidad || 0), 0);
  }

  totalEuros(): number {
    return this.obtenerItems().reduce(
      (s, i) => s + Number(i.cantidad || 0) * Number(i.precioActual || 0),
      0,
    );
  }
}