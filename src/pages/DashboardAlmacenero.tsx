import { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  ArrowRightCircle,
  Truck,
  PackageCheck,
  Bookmark,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  ShoppingCart,
  RefreshCw,
  PlusCircle,
  Clock
} from 'lucide-react';

const DashboardAlmacenero = () => {
  const [productosData, setProductosData] = useState({
    total: 458,
    bajoStock: 15,
    categorias: 24,
    nuevos: 36
  });
  
  const [busqueda, setBusqueda] = useState('');
  const [inventarioReciente, setInventarioReciente] = useState<{
    id: number;
    nombre: string;
    categoria: string;
    stock: number;
    estado: 'normal' | 'bajo' | 'crítico' | 'sobrestock';
    fecha: string;
  }[]>([
    { id: 1, nombre: 'Camiseta manga corta', categoria: 'Camisetas', stock: 45, estado: 'normal', fecha: '15/05/2025' },
    { id: 2, nombre: 'Pantalón deportivo', categoria: 'Pantalones', stock: 5, estado: 'bajo', fecha: '16/05/2025' },
    { id: 3, nombre: 'Zapatillas running', categoria: 'Calzado', stock: 2, estado: 'crítico', fecha: '17/05/2025' },
    { id: 4, nombre: 'Gorra ajustable', categoria: 'Accesorios', stock: 80, estado: 'sobrestock', fecha: '18/05/2025' },
    { id: 5, nombre: 'Sudadera con capucha', categoria: 'Abrigos', stock: 32, estado: 'normal', fecha: '19/05/2025' },
  ]);
  
  const [recepcionesPendientes, setRecepcionesPendientes] = useState([
    { id: 'REC-2345', proveedor: 'Distribuidora Textil', fechaEstimada: '22/05/2025', cantidadProductos: 45, estado: 'Programada' },
    { id: 'REC-2344', proveedor: 'ImportSport', fechaEstimada: '21/05/2025', cantidadProductos: 28, estado: 'En tránsito' },
    { id: 'REC-2343', proveedor: 'CalzadosImport', fechaEstimada: '20/05/2025', cantidadProductos: 15, estado: 'Retrasada' },
  ]);

  // Estadísticas de categorías para gráfico
  const [categoriaStats, setCategoriaStats] = useState([
    { nombre: 'Camisetas', valor: 35 },
    { nombre: 'Pantalones', valor: 25 },
    { nombre: 'Calzado', valor: 20 },
    { nombre: 'Accesorios', valor: 10 },
    { nombre: 'Abrigos', valor: 10 },
  ]);

  // Componente de tarjeta con métrica
  const TarjetaMetrica = ({ 
    titulo, 
    valor, 
    descripcion, 
    icono, 
    colorIcono 
  }: { 
    titulo: string; 
    valor: string | number; 
    descripcion?: string; 
    icono: React.ReactNode; 
    colorIcono: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{titulo}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{valor}</p>
          {descripcion && <p className="text-sm text-gray-500 mt-1">{descripcion}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorIcono}`}>
          {icono}
        </div>
      </div>
    </div>
  );

  // Filtrar inventario reciente según búsqueda
  const inventarioFiltrado = inventarioReciente.filter(item => 
    item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    item.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Estados para los gráficos de barras
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'normal': return 'bg-green-500';
      case 'bajo': return 'bg-yellow-500';
      case 'crítico': return 'bg-red-500';
      case 'sobrestock': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'normal':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Normal</span>;
      case 'bajo':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Bajo</span>;
      case 'crítico':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Crítico</span>;
      case 'sobrestock':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Sobrestock</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">{estado}</span>;
    }
  };

  const getRecepcionStateBadge = (estado: string) => {
    switch (estado) {
      case 'Programada':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Programada</span>;
      case 'En tránsito':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">En tránsito</span>;
      case 'Retrasada':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Retrasada</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">{estado}</span>;
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Cabecera con título */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard de Almacén</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Almacenero
            </span>
          </div>
          <p className="text-gray-500 mt-1">Gestión de inventario y recepciones</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex gap-2">
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <RefreshCw size={16} className="mr-2" /> Actualizar Datos
          </button>
          <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            <PlusCircle size={16} className="mr-2" /> Nuevo Producto
          </button>
        </div>
      </div>

      {/* Tarjetas métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <TarjetaMetrica 
          titulo="Total Productos" 
          valor={productosData.total}
          icono={<Package className="h-6 w-6 text-white" />}
          colorIcono="bg-blue-500"
        />
        
        <TarjetaMetrica 
          titulo="Bajo Stock" 
          valor={productosData.bajoStock}
          descripcion="Requieren reposición"
          icono={<AlertTriangle className="h-6 w-6 text-white" />}
          colorIcono="bg-red-500"
        />
        
        <TarjetaMetrica 
          titulo="Categorías" 
          valor={productosData.categorias}
          icono={<Bookmark className="h-6 w-6 text-white" />}
          colorIcono="bg-purple-500"
        />
        
        <TarjetaMetrica 
          titulo="Productos Nuevos" 
          valor={productosData.nuevos}
          descripcion="Últimos 30 días"
          icono={<PackageCheck className="h-6 w-6 text-white" />}
          colorIcono="bg-green-500"
        />
      </div>

      {/* Inventario y Recepciones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Distribución de inventario */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Categoría</h2>
          
          <div className="space-y-4">
            {categoriaStats.map((categoria, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">{categoria.nombre}</span>
                  <span className="text-sm font-medium">{categoria.valor}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${categoria.valor}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Estado del Inventario</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-xs text-gray-600">Normal: 65%</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <span className="text-xs text-gray-600">Bajo: 20%</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span className="text-xs text-gray-600">Crítico: 5%</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-xs text-gray-600">Sobrestock: 10%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recepciones pendientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recepciones Pendientes</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              Ver todas <ArrowRightCircle size={16} className="ml-1" />
            </button>
          </div>
          
          <div className="space-y-4">
            {recepcionesPendientes.map((recepcion) => (
              <div key={recepcion.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <Truck size={16} className="text-gray-500 mr-2" />
                      <span className="font-medium text-gray-900">{recepcion.id}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{recepcion.proveedor}</p>
                  </div>
                  <div>
                    {getRecepcionStateBadge(recepcion.estado)}
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    <span>{recepcion.fechaEstimada}</span>
                  </div>
                  <span>{recepcion.cantidadProductos} productos</span>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 py-2 text-sm text-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
            Crear Nueva Recepción
          </button>
        </div>
        
        {/* Actividad reciente */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Package size={16} className="text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-900">Producto actualizado</p>
                <p className="text-xs text-gray-500">Zapatilla deportiva - ID #98751</p>
                <p className="text-xs text-gray-400">Hace 5 min</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <ShoppingCart size={16} className="text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-900">Productos vendidos</p>
                <p className="text-xs text-gray-500">15 unidades de 3 productos</p>
                <p className="text-xs text-gray-400">Hace 30 min</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Truck size={16} className="text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-900">Recepción completada</p>
                <p className="text-xs text-gray-500">Recepción #REC-2342</p>
                <p className="text-xs text-gray-400">Hace 2 horas</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <PlusCircle size={16} className="text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-900">Nuevos productos</p>
                <p className="text-xs text-gray-500">Añadidos 8 nuevos productos</p>
                <p className="text-xs text-gray-400">Hace 5 horas</p>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-4 py-2 text-sm text-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
            Ver todo el historial
          </button>
        </div>
      </div>

      {/* Inventario reciente con búsqueda */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-0">Inventario Reciente</h2>
          
          <div className="w-full sm:w-64 relative">
            <input 
              type="text" 
              placeholder="Buscar producto..." 
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Actualización
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventarioFiltrado.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center mr-3">
                        <Package size={16} className="text-gray-500" />
                      </div>
                      <span className="font-medium">{item.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {item.categoria}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {item.stock} unidades
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getEstadoBadge(item.estado)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {item.fecha}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Anterior
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">1</span> a <span className="font-medium">5</span> de <span className="font-medium">24</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Anterior</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-gray-800 text-sm font-medium text-white">
                  1
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  2
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  3
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Siguiente</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAlmacenero;