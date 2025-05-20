import React ,{ useState} from 'react';

import { Outlet } from 'react-router-dom';
import SidebarMenu from './SidebarMenu';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { usuario, cerrarSesion } = useAuth();
  // Puedes usar un estado global o definir la vista inicial según el rol
  const [vistaActual, setVistaActual] = useState('ventas');

  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarMenu 
        vistaActual={vistaActual} 
        cambiarVista={setVistaActual} 
        usuario={usuario}
        cerrarSesion={cerrarSesion}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
