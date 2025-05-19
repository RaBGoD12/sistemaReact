import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import type { RolNombre } from './interfaces/enums';
import Login from './pages/Login';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardAlmacenero from './pages/DashboardAlmacenero';
import PaginaNoEncontrada from './pages/PaginaNoEncontrada';

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

    return <Navigate to="/dashboard/admin" />;
  }


  return <Navigate to="/login" />;
};

// Componente para rutas protegidas
interface RutaProtegidaProps {
  children: React.ReactNode;
  rolRequerido?: RolNombre;
}

const RutaProtegida = ({ children, rolRequerido }: RutaProtegidaProps) => {
  const { usuario, tieneRol } = useAuth();
  
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  
  if (rolRequerido && !tieneRol(rolRequerido)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      {/* Ruta principal redirige al dashboard según el rol */}
      <Route path="/" element={<RedirectToDashboard />} />
      
      {/* Ruta de login */}
      <Route path="/login" element={<Login />} />
      
      {/* Rutas de dashboard por rol */}
      <Route 
        path="/dashboard/admin" 
        element={
          <RutaProtegida rolRequerido="ADMIN">
            <DashboardAdmin />
          </RutaProtegida>
        } 
      />
      
      <Route 
        path="/dashboard/almacenero" 
        element={
          <RutaProtegida rolRequerido="ALMACENERO">
            <DashboardAlmacenero />
          </RutaProtegida>
        } 
      />
      
      {/* Ruta para páginas no encontradas */}
      <Route path="*" element={<PaginaNoEncontrada />} />
    </Routes>
  );
}

export default App;