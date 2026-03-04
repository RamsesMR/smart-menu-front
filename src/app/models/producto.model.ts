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
