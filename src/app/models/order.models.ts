/**
 * Representa una línea individual dentro de un pedido.
 * * Contiene la referencia al producto y los detalles específicos de la comanda.
 */
export interface OrderItem {
  productoId: string;
  cantidad: number;
  notas?: string;
}

/**
 * Objeto de transferencia de datos (DTO) enviado al backend para registrar una nueva comanda.
 */
export interface CreateOrderRequest {
  mesaId?: string;
  items: OrderItem[];
}

/**
 * Representación del estado de un pedido según el flujo de trabajo de la cocina.
 * * Utilizado para el seguimiento en tiempo real desde el frontend.
 */ export interface OrderResponse {
  id: string;
  estado: 'RECIBIDO' | 'PREPARANDO' | 'LISTO' | 'ENTREGADO';
  total?: number;
}
