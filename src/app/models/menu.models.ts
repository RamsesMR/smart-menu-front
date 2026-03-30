/**
 * Representación técnica de un producto (plato o bebida) dentro del catálogo.
 * * Esta interfaz mapea los datos provenientes del Backend (MongoDB) y se utiliza
 * en toda la lógica de visualización del menú.
 */
export interface Producto {
  id?: any;
  _id?: any;
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

/**
 * Estructura de la respuesta estándar del servidor para las peticiones de catálogo.
 */
export interface MenuResponse {
  productos: Producto[];
}
