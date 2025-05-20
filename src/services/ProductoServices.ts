import axios from 'axios';
import type { Producto } from '../interfaces/Producto';
import apiClient from '../config/apiClient';


export const ProductoService = {
  getAllProductos: async (): Promise<Producto[]> => {
    const response = await apiClient.get<Producto[]>('/productos');
    return response.data;
  },

  getProductoById: async (id: number): Promise<Producto> => {
    const response = await apiClient.get<Producto>(`/productos/${id}`);
    return response.data;
  },


  createProducto: async (productoData: Omit<Producto, 'idProducto'>): Promise<Producto> => {
    const response = await apiClient.post<Producto>('/productos', productoData);
    return response.data;
  },

  updateProducto: async (id: number, productoData: Producto): Promise<Producto> => {
    const response = await apiClient.put<Producto>(`/productos/${id}`, productoData);
    return response.data;
  },

  deleteProducto: async (id: number): Promise<void> => {
    await apiClient.delete(`/productos/${id}`);
  },

  getProductosByCategoria: async (nombreCategoria: string): Promise<Producto[]> => {
    const response = await apiClient.get<Producto[]>(`/productos/categoria/${encodeURIComponent(nombreCategoria)}`);
    return response.data;
  },

  // El backend usa /distribuidor/{nombreDistribuidor} para proveedores
  getProductosByProveedor: async (nombreProveedor: string): Promise<Producto[]> => {
    const response = await apiClient.get<Producto[]>(`/productos/distribuidor/${encodeURIComponent(nombreProveedor)}`);
    return response.data;
  },

  getProductosByCodigo: async (codigo: string): Promise<Producto[]> => {
    const response = await apiClient.get<Producto[]>(`/productos/codigo/${encodeURIComponent(codigo)}`);
    return response.data;
  },

  getProductosByNombre: async (nombre: string): Promise<Producto[]> => {
    const response = await apiClient.get<Producto[]>(`/productos/nombre/${encodeURIComponent(nombre)}`);
    return response.data;
  },
};