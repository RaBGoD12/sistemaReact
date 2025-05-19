import type { Categoria } from './Categoria';
import type {Proveedor } from './Proveedores';

export interface Producto {
  idProducto?: number;
  codigoIdentificacion: string;
  nombre: string;
  categoria: Categoria;
  distribuidor: Proveedor;
  cantidad: number;
}

export interface Precio {
  idDescuento?: number;
  producto: Producto;
  precioUnitario: number;
  precioCuarto?: number;
  precioMediaDocena?: number;
  precioDocena?: number;
}