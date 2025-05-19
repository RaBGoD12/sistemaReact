import axios from 'axios';
import type { Usuario } from '../interfaces/Usuario';

const API_URL = 'http://localhost:8080';

export const ServicioUsuarios = {
  obtenerTodos: async (): Promise<Usuario[]> => {
    const respuesta = await axios.get<Usuario[]>(`${API_URL}/api/v1/user`);
    return respuesta.data;
  },
  
  crear: async (datosUsuario: { usuario: string, clave: string, rol: string }): Promise<Usuario> => {
    const respuesta = await axios.post<Usuario>(`${API_URL}/api/v1/user/createUser`, datosUsuario);
    return respuesta.data;
  },
  
  actualizar: async (id: number, datosUsuario: Usuario): Promise<Usuario> => {
    const respuesta = await axios.put<Usuario>(`${API_URL}/api/v1/user/${id}`, datosUsuario);
    return respuesta.data;
  },
  
  deshabilitar: async (id: number): Promise<void> => {
    await axios.put(`${API_URL}/api/v1/user/deshabilitar/${id}`);
  },
  
  habilitar: async (id: number): Promise<void> => {
    await axios.put(`${API_URL}/api/v1/user/habilitar/${id}`);
  }
};