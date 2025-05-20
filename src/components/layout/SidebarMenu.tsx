import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Usuario } from '../../interfaces/Usuario';

interface SidebarMenuProps {
  vistaActual: string;
  cambiarVista: (vista: string) => void;
  usuario: Usuario | null;
  cerrarSesion: () => void;
  children?: React.ReactNode;
}

const SidebarMenu = ({ vistaActual, cambiarVista, usuario, cerrarSesion }: SidebarMenuProps) => {
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [mostrarCaja, setMostrarCaja] = useState(false);
  const navigate = useNavigate();
  const { tieneRol } = useAuth();

  const toggleSidebar = () => {
    setSidebarAbierto(!sidebarAbierto);
  };

  const MenuItem = ({ texto, vista }: { texto: string; vista: string }) => (
    <button
      className={`w-full flex items-center px-4 py-3 text-sm ${
        vistaActual === vista
          ? 'bg-blue-600 text-white'
          : 'text-gray-300 hover:bg-gray-800'
      } rounded-md transition-colors`}
      onClick={() => {
        cambiarVista(vista);
        // Redirigir según la vista seleccionada
        navigate('/pages/CajeroSistemaVentas', { state: { view: vista } });
      }}
    >
      {getIconoParaVista(vista)}
      <span className="ml-3">{texto}</span>
    </button>
  );

  const handleLogout = () => {
    cerrarSesion();
    navigate('/login');
  };

  const getIconoParaVista = (vista: string) => {
    switch (vista) {
      case 'apertura':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case 'ventas':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        );
      case 'cierre':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Overlay para cerrar el sidebar en móvil */}
      {sidebarAbierto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" 
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 w-64 bg-black text-white transform transition-transform duration-300 ease-in-out z-30
          ${sidebarAbierto ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:z-0
        `}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <h1 className="text-xl font-bold">VENTASPRO</h1>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 lg:hidden"
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-4 py-5 border-b border-gray-700">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{usuario?.usuario || 'Usuario'}</p>
              <p className="text-xs text-gray-400">
                {tieneRol('CAJERO') && 'Cajero'}
                {tieneRol('ADMIN') && 'Administrador'}
                {tieneRol('ALMACENERO') && 'Almacenero'}
              </p>
            </div>
          </div>
        </div>

        <nav className="px-4 py-5 space-y-6">
          {/* Botones de Dashboard */}
          <div className="space-y-2">
            {tieneRol('ADMIN') && (
              <button
                onClick={() => {
                  navigate('/dashboard/admin');
                  cambiarVista('dashboard');
                }}
                className={`w-full flex items-center px-4 py-3 text-sm ${
                  vistaActual === 'dashboard-admin'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                } rounded-md transition-colors`}
              >
                {/* Icono representativo para dashboard admin */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h4v11H3zM9 3h4v18H9zM15 14h4v7h-4z" />
                </svg>
                <span className="ml-3">Dashboard Admin</span>
              </button>
            )}
            {tieneRol('ALMACENERO') && (
              <button
                onClick={() => {
                  navigate('/dashboard/almacenero');
                  cambiarVista('dashboard');
                }}
                className={`w-full flex items-center px-4 py-3 text-sm ${
                  vistaActual === 'dashboard-almacenero'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                } rounded-md transition-colors`}
              >
                {/* Icono representativo para dashboard almacenero */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="ml-3">Dashboard Almacenero</span>
              </button>
            )}
            {tieneRol('CAJERO') && (
              <button
                onClick={() => {
                  navigate('/pages/CajeroSistemaVentas');
                  cambiarVista('ventas');
                }}

              >

              </button>
            )}
          </div>

          {/* Bloque de Sistema de Caja (solo para CAJERO y ADMIN) */}
          {(tieneRol('CAJERO') || tieneRol('ADMIN')) && (
            <>
              {tieneRol('ADMIN') && (
                <button
                  onClick={() => setMostrarCaja(!mostrarCaja)}
                  className="w-full flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="ml-3">Sistema de Caja</span>
                </button>
              )}
              {tieneRol('CAJERO') || (tieneRol('ADMIN') && mostrarCaja) ? (
                <div className="space-y-2">
                  <MenuItem texto="Apertura de Caja" vista="apertura" />
                  <MenuItem texto="Ventas" vista="ventas" />
                  <MenuItem texto="Cierre de Caja" vista="cierre" />
                </div>
              ) : null}
            </>
          )}
          {/* Aquí puedes agregar otros botones si lo deseas */}

          <div className="mt-auto">
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm w-full"
      >
        Cerrar Sesión
      </button>
    </div>
          
        </nav>
        
      </div>

      

      {/* Botón para abrir sidebar en móvil */}
      <button
        onClick={toggleSidebar}
        className="fixed bottom-4 left-4 p-3 rounded-full bg-blue-600 text-white shadow-lg z-10 lg:hidden"
      >
        <Menu size={24} />
      </button>

      
    </>
  );
};

export default SidebarMenu;