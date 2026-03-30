/**
 * Interfaz que representa la estructura nativa de un Producto en la base de datos.
 * * @description A diferencia del modelo de vista, esta interfaz refleja el formato
 * de persistencia de MongoDB, incluyendo el mapeo de objetos de identificador complejo.
 */
export interface Producto {
  _id?: {
    $oid: string;
  };
  nombre: string;
  descripcion: string;
  precio: number;
  tipoIva: number;
  importeIva: number;
  precioConIva: number;
  imagen: string;
  disponible: boolean;
}
