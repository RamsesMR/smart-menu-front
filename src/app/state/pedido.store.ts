import { Injectable } from '@angular/core';

/**
 * Define la estructura de un producto dentro del carrito,
 * incluyendo su estado de envío a cocina.
 */
export type ItemCarrito = {
  /** ID único del producto. */
  productoId?: string;
  /** Nombre del producto al momento de añadirlo. */
  nombreActual: string;
  /** Precio unitario registrado. */
  precioActual: number;
  /** Cantidad de unidades. */
  cantidad: number;
  /** Comentario opcional para el cocinero. */
  nota?: string;
  /** Valor energético del producto. */
  kcal?: number;
  /** Indica si el producto ya fue enviado en una ronda previa. */
  enviado?: boolean;
};

/**
 * Servicio de persistencia global.
 * Gestiona el carrito actual, la identificación de la mesa y el histórico de comandas.
 */
@Injectable({ providedIn: 'root' })
export class PedidoStore {
  private clave = 'sm_carrito';
  private claveMesa = 'sm_mesa';
  private claveId = 'sm_pedido_id';
  private claveHistorial = 'sm_historial_pedidos';
  private estadoPedido = localStorage.getItem('estado_actual') || 'NUEVO';

  /**
   * Registra el identificador de la mesa actual.
   * @param mesa Número o nombre de la mesa.
   */
  guardarMesa(mesa: string) {
    localStorage.setItem(this.claveMesa, mesa || '');
  }

  /**
   * Recupera la mesa guardada.
   * @returns El identificador de la mesa.
   */
  obtenerMesa(): string {
    return localStorage.getItem(this.claveMesa) || '';
  }

  /**
   * Guarda el ID único de la sesión del pedido.
   * @param id Identificador del pedido.
   */
  guardarIdPedido(id: string) {
    localStorage.setItem(this.claveId, id);
  }

  /**
   * Recupera el ID del pedido o genera uno nuevo si no existe.
   * @returns Identificador único.
   */
  obtenerIdPedido(): string {
    let id = localStorage.getItem(this.claveId);
    if (!id) {
      id = 'ped' + Math.random().toString(36).substr(2, 9);
      this.guardarIdPedido(id);
    }
    return id;
  }

  /**
   * Actualiza el estado global del pedido.
   * @param nuevoEstado Estado como NUEVO, EN_PREPARACION, etc.
   */
  guardarEstado(nuevoEstado: string) {
    this.estadoPedido = nuevoEstado;
    localStorage.setItem('estado_actual', nuevoEstado);
  }

  /**
   * Obtiene el estado actual registrado.
   * @returns Estado técnico del pedido.
   */
  obtenerEstado() {
    return localStorage.getItem('estado_actual') || this.estadoPedido;
  }

  /**
   * Recupera todas las rondas enviadas históricamente por la mesa.
   * @returns Lista de comandas almacenadas.
   */
  obtenerHistorial(): any[] {
    try {
      return JSON.parse(localStorage.getItem(this.claveHistorial) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Añade una nueva comanda confirmada al historial local.
   * @param comanda Objeto con los datos de la ronda enviada.
   */
  agregarAlHistorial(comanda: any) {
    const historial = this.obtenerHistorial();
    historial.push(comanda);
    localStorage.setItem(this.claveHistorial, JSON.stringify(historial));
  }

  /**
   * Obtiene los productos que están actualmente en el carrito de selección.
   * @returns Lista de items.
   */
  obtenerItems(): ItemCarrito[] {
    try {
      return JSON.parse(localStorage.getItem(this.clave) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Persiste la lista de productos del carrito.
   * @param items Lista de productos.
   */
  guardarItems(items: ItemCarrito[]) {
    localStorage.setItem(this.clave, JSON.stringify(items || []));
  }

  /**
   * Elimina toda la información del pedido actual, la mesa y el historial.
   */
  vaciar() {
    localStorage.removeItem(this.clave);
    localStorage.removeItem(this.claveMesa);
    localStorage.removeItem(this.claveId);
    localStorage.removeItem(this.claveHistorial);
    localStorage.removeItem('estado_actual');
    localStorage.removeItem('mock_estados_pedidos');
  }

  /**
   * Cuenta el total de productos en el carrito.
   * @returns Cantidad de unidades.
   */
  totalItems(): number {
    return this.obtenerItems().reduce((a, i) => a + (i.cantidad || 0), 0);
  }

  /**
   * Calcula el coste total del carrito actual.
   * @returns Importe total.
   */
  totalEuros(): number {
    return this.obtenerItems().reduce((s, i) => s + (i.cantidad || 0) * (i.precioActual || 0), 0);
  }
}
