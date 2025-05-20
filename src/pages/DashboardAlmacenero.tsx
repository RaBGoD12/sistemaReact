

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardAlmacenero = () => {
  const { usuario, cerrarSesion } = useAuth();
  const navegar = useNavigate();



  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-900 text-white shadow">
        <div className="mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-xl">VENTASPRO</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="hidden md:inline">Conectado como: </span>
              <span className="font-medium">{usuario?.usuario}</span>
            </div>
          
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="pb-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Panel de Almacenero</h2>
        </div>

        <div className="mt-8 bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center justify-center h-40 bg-green-50 rounded-lg mb-6">
            <div className="text-center">
              <div className="text-green-500 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900">Bienvenido al Sistema</h3>
              <p className="mt-1 text-gray-600">Has iniciado sesión como Almacenero</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-700 mb-3">Productos</h3>
              <p className="text-2xl font-bold text-gray-900">458</p>
              <p className="text-sm text-gray-500">Productos totales</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-medium text-red-700 mb-3">Productos críticos</h3>
              <p className="text-2xl font-bold text-gray-900">15</p>
              <p className="text-sm text-gray-500">Bajo stock</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-700 mb-3">Categorías</h3>
              <p className="text-2xl font-bold text-gray-900">24</p>
              <p className="text-sm text-gray-500">Categorías disponibles</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardAlmacenero;