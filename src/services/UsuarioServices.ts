import axios from 'axios';
import type { Usuario } from '../interfaces/Usuario';

const API_URL = 'http://localhost:8080';

export interface UsuarioDTO extends Usuario {
  // Si el DTO del backend tiene campos adicionales que no están en la interfaz Usuario
  // puedes agregarlos aquí
}

export const ServicioUsuarios = {
  obtenerTodos: async (): Promise<Usuario[]> => {
    const respuesta = await axios.get<Usuario[]>(`${API_URL}/api/v1/user`);
    return respuesta.data;
  },

  obtenerUsuariosConRoles: async (): Promise<UsuarioDTO[]> => {
    const respuesta = await axios.get<UsuarioDTO[]>(`${API_URL}/api/v1/user/with-roles`);
    return respuesta.data;
  },
  
  obtenerUsuarioConRoles: async (id: number): Promise<UsuarioDTO> => {
    const respuesta = await axios.get<UsuarioDTO>(`${API_URL}/api/v1/user/${id}/with-roles`);
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