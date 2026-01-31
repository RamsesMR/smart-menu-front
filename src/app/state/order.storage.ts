import { Injectable } from '@angular/core';

/**
 * Estructura de un producto dentro del carrito de compras.
 */
export type CartItem = {
  /** Identificador único del producto. */
  productoId: string;
  /** Nombre del producto al momento de la selección. */
  nombreActual: string;
  /** Precio por unidad. */
  precioActual: number;
  /** Unidades seleccionadas por el cliente. */
  cantidad: number;
  /** Observaciones adicionales para la preparación. */
  nota?: string;
};

/**
 * Servicio encargado de la persistencia local del carrito de compras.
 * Gestiona el almacenamiento de productos de forma temporal en el navegador.
 */
@Injectable({ providedIn: 'root' })
export class OrderStore {
  /** Clave utilizada para almacenar los datos en localStorage. */
  private key = 'sm_cart';

  /**
   * Recupera el listado de productos almacenados actualmente.
   * @returns Array de objetos CartItem o un array vacío si no hay datos o el formato es inválido.
   */
  getItems(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem(this.key) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Sobrescribe el listado de productos en el almacenamiento local.
   * @param items Lista de productos a persistir.
   */
  setItems(items: CartItem[]) {
    localStorage.setItem(this.key, JSON.stringify(items || []));
  }

  /**
   * Elimina todos los productos almacenados y limpia el carrito.
   */
  clear() {
    localStorage.removeItem(this.key);
  }

  /**
   * Calcula la cantidad total de unidades seleccionadas en el carrito.
   * @returns Suma total de cantidades.
   */
  getTotalItems(): number {
    return this.getItems().reduce((a, i) => a + (i.cantidad || 0), 0);
  }

  /**
   * Calcula el importe total económico del carrito actual.
   * @returns Suma del precio por cantidad de todos los productos.
   */
  getTotalEuros(): number {
    return this.getItems().reduce((s, i) => s + (i.cantidad || 0) * (i.precioActual || 0), 0);
  }
}
