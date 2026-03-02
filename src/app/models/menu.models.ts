/** Representación técnica de un plato o bebida */
export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tipoIva: number;
  importeIva: number;
  precioConIva: number;
  imagen?: string;
  disponible: boolean;
  categoria?: string;
  kcal?: number;
}

export interface MenuResponse {
  productos: Producto[];
}
