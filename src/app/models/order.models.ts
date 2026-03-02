/** Producto individual dentro de una comanda */
export interface OrderItem {
  productoId: string;
  cantidad: number;
  notas?: string;
}

/** Petición para registrar un nuevo pedido */
export interface CreateOrderRequest {
  mesaId?: string;
  items: OrderItem[];
}

/** Información de seguimiento de un pedido activo */
export interface OrderResponse {
  id: string;
  estado: 'RECIBIDO' | 'PREPARANDO' | 'LISTO' | 'ENTREGADO';
  total?: number;
}
