import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import type { Usuario } from '../interfaces/Usuario';
import type { CredencialesLogin, RespuestaAutenticacion } from '../interfaces/Usuario';
import type { RolNombre } from '../interfaces/enums';

// Constantes para los roles
const ADMIN_ROLE: RolNombre = 'ADMIN';
const ALMACENERO_ROLE: RolNombre = 'ALMACENERO';
const CAJERO_ROLE: RolNombre = 'CAJERO';

interface TokenDecodificado {
  sub: string;
  authorities?: string | string[];
  exp: number;
  [key: string]: any;
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
  
  // Usar useRef para almacenar el interceptor actual
  const interceptorRef = useRef<number | null>(null);

  // Función para asignar un rol basado en el nombre de usuario (solución temporal)
  const asignarRolPorNombreUsuario = (nombreUsuario: string): RolNombre => {
    console.log('Asignando rol basado en nombre de usuario:', nombreUsuario);
    
    if (nombreUsuario.toLowerCase().includes('admin')) {
      return ADMIN_ROLE;
    } else if (nombreUsuario.toLowerCase().includes('almacen')) {
      return ALMACENERO_ROLE;
    } else {
      // Por defecto asignamos CAJERO
      return CAJERO_ROLE;
    }
  };

  useEffect(() => {
    const tokenAlmacenado = localStorage.getItem('token');
    if (tokenAlmacenado) {
      try {
        const decodificado = jwtDecode<TokenDecodificado>(tokenAlmacenado);
        const tiempoActual = Date.now() / 1000;
        
        if (decodificado.exp && decodificado.exp < tiempoActual) {
          console.log('Token expirado, cerrando sesión...');
          cerrarSesion();
        } else {
          console.log('Token válido, estableciendo usuario...');
          setToken(tokenAlmacenado);
          
          // Obtener el nombre de usuario
          const nombreUsuario = decodificado.sub;
          
          // Para este backend específico, asignar rol basado en el nombre de usuario
          // ya que authorities está vacío
          const rolAsignado = asignarRolPorNombreUsuario(nombreUsuario);
          
          console.log(`Asignando rol ${rolAsignado} a usuario ${nombreUsuario}`);
          
          setUsuario({
            usuario: nombreUsuario,
            roles: [{ nombreRol: rolAsignado }]
          });
        }
      } catch (error) {
        console.error('Error al decodificar token:', error);
        cerrarSesion();
      }
    }
    setCargando(false);
  }, []);

  // Configurar el interceptor de axios para el token
  useEffect(() => {
    console.log('Configurando interceptor de axios con token:', token ? 'Presente' : 'Ausente');
    
    // Si hay un interceptor previo, eliminarlo primero
    if (interceptorRef.current !== null) {
      axios.interceptors.request.eject(interceptorRef.current);
      interceptorRef.current = null;
    }
    
    // Crear nuevo interceptor
    interceptorRef.current = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Añadiendo token a la solicitud');
        }
        return config;
      },
      (error) => {
        console.error('Error en interceptor de solicitud:', error);
        return Promise.reject(error);
      }
    );

    // También agregar un interceptor de respuesta para manejar errores de autenticación
    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          console.warn('Respuesta 401 recibida, token inválido o expirado');
          cerrarSesion();
        }
        return Promise.reject(error);
      }
    );

    // Función de limpieza
    return () => {
      if (interceptorRef.current !== null) {
        axios.interceptors.request.eject(interceptorRef.current);
      }
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  const iniciarSesion = async (credenciales: CredencialesLogin): Promise<boolean> => {
    try {
      setError(null);
      setCargando(true);
      console.log('Iniciando sesión con:', { usuario: credenciales.usuario });
      
      const respuesta = await axios.post<RespuestaAutenticacion>(
        'http://localhost:8080/api/v1/autenticacion/signin', 
        {
          usuario: credenciales.usuario,
          clave: credenciales.clave
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Respuesta de autenticación:', respuesta.data);
      const { jwt, status } = respuesta.data;
      
      if (jwt && status) {
        localStorage.setItem('token', jwt);
        setToken(jwt);
        
        try {
          const decodificado = jwtDecode<TokenDecodificado>(jwt);
          const nombreUsuario = decodificado.sub;
          
          // Asignar rol basado en el nombre de usuario
          const rolAsignado = asignarRolPorNombreUsuario(nombreUsuario);
          
          console.log(`Asignando rol ${rolAsignado} a usuario ${nombreUsuario} durante login`);
          
          setUsuario({
            usuario: nombreUsuario,
            roles: [{ nombreRol: rolAsignado }]
          });
          
          return true;
        } catch (error) {
          console.error('Error al decodificar token:', error);
          setError('Error al procesar el token recibido');
          return false;
        }
      }
      
      setError('No se recibió un token válido');
      return false;
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      setError(error.response?.data?.message || 'Error al iniciar sesión');
      return false;
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    console.log('Cerrando sesión, eliminando token...');
    localStorage.removeItem('token');
    setToken(null);
    setUsuario(null);
  };

  const tieneRol = (rol: RolNombre): boolean => {
    if (!usuario || !usuario.roles || usuario.roles.length === 0) {
      console.log(`Verificando rol ${rol}: usuario sin roles`);
      return false;
    }
    
    const tieneElRol = usuario.roles.some(r => r.nombreRol === rol);
    console.log(`Verificando rol ${rol}:`, tieneElRol ? 'SÍ lo tiene' : 'NO lo tiene');
    
    return tieneElRol;
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