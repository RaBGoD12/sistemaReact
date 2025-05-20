import axios from 'axios';
import { PRODUCT_ROUTES } from '../config/apiConfig';
import type { Producto, Precio } from '../interfaces/Producto';

export const ProductoServices = {
  obtenerTodos: async (): Promise<Producto[]> => {
    const respuesta = await axios.get<Producto[]>(PRODUCT_ROUTES.BASE);
    return respuesta.data;
  },
  
  obtenerPorId: async (id: number): Promise<Producto> => {
    const respuesta = await axios.get<Producto>(PRODUCT_ROUTES.BY_ID(id));
    return respuesta.data;
  },
  
  obtenerPorCodigo: async (codigo: string): Promise<Producto> => {
    const respuesta = await axios.get<Producto>(PRODUCT_ROUTES.BY_CODE(codigo));
    return respuesta.data;
  },
  
  buscarPorNombre: async (nombre: string): Promise<Producto[]> => {
    const respuesta = await axios.get<Producto[]>(PRODUCT_ROUTES.BY_NAME(nombre));
    return respuesta.data;
  },
  
  buscarPorCategoria: async (categoria: string): Promise<Producto[]> => {
    const respuesta = await axios.get<Producto[]>(PRODUCT_ROUTES.BY_CATEGORY(categoria));
    return respuesta.data;
  },
  
  obtenerPrecios: async (idProducto: number): Promise<Precio[]> => {
    const respuesta = await axios.get<Precio[]>(PRODUCT_ROUTES.PRICES(idProducto));
    return respuesta.data;
  },
  
  obtenerStock: async (): Promise<Producto[]> => {
    // Endpoint específico para obtener solo productos con stock
    const respuesta = await axios.get<Producto[]>(`${PRODUCT_ROUTES.BASE}/stock`);
    return respuesta.data;
  }
};