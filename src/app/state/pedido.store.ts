import { Injectable } from '@angular/core';

/**
 * Define la estructura de un producto dentro del carrito de compras.
 * * @description Incluye metadatos necesarios para la visualización en el frontend
 * y para el procesamiento de la comanda en la cocina.
 */
export type ItemCarrito = {
  /** ID único del producto. */
  productoId: string;
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
 * Servicio de gestión de estado y persistencia local del pedido.
 * * @description Centraliza todas las operaciones de lectura y escritura en el `localStorage`
 * del navegador. Gestiona el ciclo de vida de una comanda: desde la asignación de mesa
 * hasta el histórico de productos consumidos.
 */
@Injectable({ providedIn: 'root' })
export class PedidoStore {
  private clave = 'sm_carrito';
  private claveMesa = 'sm_mesa';
  private claveId = 'sm_pedido_id';
  private claveHistorial = 'sm_historial_pedidos';
  private estadoPedido = localStorage.getItem('estado_actual') || 'NUEVO';

  /**
   * Registra el identificador de la mesa en el almacenamiento local.
   * @param mesa Número o nombre descriptivo de la mesa.
   */
  guardarMesa(mesa: string) {
    localStorage.setItem(this.claveMesa, mesa || '');
  }

  /**
   * Recupera la mesa vinculada a la sesión actual.
   * @returns El identificador de la mesa o un string vacío si no existe.
   */
  obtenerMesa(): string {
    return localStorage.getItem(this.claveMesa) || '';
  }

  /**
   * Persiste el identificador único de la comanda.
   * @param id Identificador generado por el sistema o el servidor.
   */
  guardarIdPedido(id: string) {
    localStorage.setItem(this.claveId, id);
  }

  /**
   * Recupera el ID del pedido actual.
   * Si no existe uno previo, genera automáticamente un ID temporal único.
   * @returns Identificador alfanumérico del pedido.
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
   * Actualiza y persiste el estado del flujo de trabajo del pedido.
   * @param nuevoEstado Valores esperados: 'NUEVO', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO'.
   */
  guardarEstado(nuevoEstado: string) {
    this.estadoPedido = nuevoEstado;
    localStorage.setItem('estado_actual', nuevoEstado);
  }

  /**
   * Obtiene el estado técnico en el que se encuentra la comanda actual.
   * @returns El estado almacenado en el navegador.
   */
  obtenerEstado() {
    return localStorage.getItem('estado_actual') || this.estadoPedido;
  }

  /**
   * Recupera el historial de todas las rondas de productos enviadas con éxito.
   * @returns Array de objetos que representan las comandas confirmadas.
   */
  obtenerHistorial(): any[] {
    try {
      return JSON.parse(localStorage.getItem(this.claveHistorial) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Agrega una nueva ronda confirmada al histórico de la sesión.
   * @param comanda Objeto con el detalle de la ronda recién enviada a cocina.
   */
  agregarAlHistorial(comanda: any) {
    const historial = this.obtenerHistorial();
    historial.push(comanda);
    localStorage.setItem(this.claveHistorial, JSON.stringify(historial));
  }

  /**
   * Recupera la lista de productos que el usuario tiene actualmente en su bandeja de selección.
   * @returns Un array de {@link ItemCarrito}.
   */
  obtenerItems(): ItemCarrito[] {
    try {
      return JSON.parse(localStorage.getItem(this.clave) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Guarda la lista actual de productos en el carrito.
   * @param items Colección de productos a persistir.
   */
  guardarItems(items: ItemCarrito[]) {
    localStorage.setItem(this.clave, JSON.stringify(items || []));
  }

  /**
   * Realiza una limpieza total de la sesión.
   * Borra carrito, mesa, historial y estados para permitir un nuevo ciclo de pedido.
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
   * Realiza un conteo acumulado de todas las unidades de productos en el carrito.
   * @returns Cantidad total de artículos seleccionados.
   */
  totalItems(): number {
    return this.obtenerItems().reduce((a, i) => a + (i.cantidad || 0), 0);
  }

  /**
   * Calcula el importe total económico del carrito actual basándose en los precios capturados.
   * @returns Suma total en euros (o moneda local).
   */
  totalEuros(): number {
    return this.obtenerItems().reduce((s, i) => s + (i.cantidad || 0) * (i.precioActual || 0), 0);
  }
}
