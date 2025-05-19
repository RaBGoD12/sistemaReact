import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import type { Usuario } from '../interfaces/Usuario';
import type { CredencialesLogin, RespuestaAutenticacion } from '../interfaces/Usuario';
import type { RolNombre } from '../interfaces/enums';

interface TokenDecodificado {
  sub: string;
  authorities: string;
  exp: number;
}

interface ContextoAutenticacion {
  usuario: Usuario | null;
  cargando: boolean;
  error: string | null;
  iniciarSesion: (credenciales: CredencialesLogin) => Promise<boolean>;
  cerrarSesion: () => void;
  tieneRol: (rol: RolNombre) => boolean;
}

const ContextoAuth = createContext<ContextoAutenticacion | undefined>(undefined);

export const useAuth = (): ContextoAutenticacion => {
  const contexto = useContext(ContextoAuth);
  if (!contexto) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return contexto;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tokenAlmacenado = localStorage.getItem('token');
    if (tokenAlmacenado) {
      try {
        const decodificado = jwtDecode<TokenDecodificado>(tokenAlmacenado);
        const tiempoActual = Date.now() / 1000;
        
        if (decodificado.exp && decodificado.exp < tiempoActual) {
          cerrarSesion();
        } else {
          setToken(tokenAlmacenado);
          setUsuario({
            usuario: decodificado.sub,
            roles: decodificado.authorities.split(',').map(rol => ({
              nombreRol: rol.replace('ROLE_', '') as RolNombre
            }))
          });
        }
      } catch (error) {
        cerrarSesion();
      }
    }
    setCargando(false);
  }, []);

  // Configurar el interceptor de axios para el token
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => axios.interceptors.request.eject(interceptor);
  }, [token]);

  const iniciarSesion = async (credenciales: CredencialesLogin): Promise<boolean> => {
    try {
      setError(null);
      setCargando(true);
      
      const respuesta = await axios.post<RespuestaAutenticacion>(
        'http://localhost:8080/api/v1/autenticacion/signin', 
        {
          usuario: credenciales.usuario,
          clave: credenciales.clave
        }
      );
      
      const { jwt } = respuesta.data;
      
      if (jwt) {
        localStorage.setItem('token', jwt);
        setToken(jwt);
        
        const decodificado = jwtDecode<TokenDecodificado>(jwt);
        setUsuario({
          usuario: decodificado.sub,
          roles: decodificado.authorities.split(',').map(rol => ({
            nombreRol: rol.replace('ROLE_', '') as RolNombre
          }))
        });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al iniciar sesión');
      return false;
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUsuario(null);
  };

  const tieneRol = (rol: RolNombre): boolean => {
    return !!usuario?.roles?.some(r => r.nombreRol === rol);
  };

  const valor: ContextoAutenticacion = {
    usuario,
    cargando,
    error,
    iniciarSesion,
    cerrarSesion,
    tieneRol,
  };

  return <ContextoAuth.Provider value={valor}>{children}</ContextoAuth.Provider>;
};