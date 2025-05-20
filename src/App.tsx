import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import type { RolNombre } from './interfaces/enums';
import Login from './pages/Login';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardAlmacenero from './pages/DashboardAlmacenero';
import PaginaNoEncontrada from './pages/PaginaNoEncontrada';
import CajeroSistemaVentas from './pages/CajeroSistemaVentas';
import SidebarMenu from './components/layout/SidebarMenu';
import AperturaCaja from './components/cajero/AperturaCaja';
import CierreCaja from './components/cajero/CierreCaja';  
import Layout from './components/layout/Layout';

// Componente para redirigir al dashboard según el rol
const RedirectToDashboard = () => {
  const { usuario, tieneRol } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" />;
  }

  if (tieneRol('ADMIN')) {
    return <Navigate to="/dashboard/admin" />;
  } else if (tieneRol('ALMACENERO')) {
    return <Navigate to="/dashboard/almacenero" />;
  } else if (tieneRol('CAJERO')) {
    return <Navigate to="/pages/CajeroSistemaVentas" />;
  }

  return <Navigate to="/login" />;
};

// Componente para rutas protegidas
interface RutaProtegidaProps {
  children: React.ReactNode | ((authProps: { usuario: any; cerrarSesion: () => void }) => React.ReactNode);
  rolRequerido?: RolNombre;
}

const RutaProtegida = ({ children, rolRequerido }: RutaProtegidaProps) => {
  const { usuario, tieneRol, cerrarSesion } = useAuth();
  
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  
  if (rolRequerido && !tieneRol(rolRequerido)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{typeof children === 'function' ? children({ usuario, cerrarSesion }) : children}</>;
};

function App() {
  return (
    <Routes>
      {/* Ruta principal redirige al dashboard según el rol */}
      <Route path="/" element={<RedirectToDashboard />} />
      
      {/* Ruta de login */}
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas con layout global */}
      <Route element={<RutaProtegida><Layout /></RutaProtegida>}>
        <Route path="/dashboard/admin" element={<DashboardAdmin />} />
        <Route path="/dashboard/almacenero" element={<DashboardAlmacenero />} />
        <Route path="/pages/CajeroSistemaVentas" element={<CajeroSistemaVentas />} />
      </Route>
      
      {/* Ruta para páginas no encontradas */}
      <Route path="*" element={<PaginaNoEncontrada />} />
    </Routes>
  );
}

export default App;