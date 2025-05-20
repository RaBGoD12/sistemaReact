import { useState, useEffect } from 'react';
import { ProductoServices } from '../../services/ProductoServices';
import type { Producto, Precio } from '../../interfaces/Producto';

interface ProductoVenta {
  idProducto: number;
  codigo: string;
  descripcion: string;
  talla: string;
  cantidad: number;
  precio: number;
  total: number;
}

const VentasPanel = () => {
  // Estados para la gestión de productos y venta
  const [busqueda, setBusqueda] = useState('');
  const [cliente, setCliente] = useState('');
  const [codigoMayorista, setCodigoMayorista] = useState('');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoVenta[]>([]);
  const [metodoPago, setMetodoPago] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<{ nombre: string; icono: string }[]>([
    { nombre: 'Polo c/v', icono: 'tshirt' },
    { nombre: 'Medias', icono: 'socks' },
    { nombre: 'Pantalones', icono: 'pants' },
    { nombre: 'Camisas', icono: 'shirt' },
    { nombre: 'Vestidos', icono: 'dress' },
    { nombre: 'Accesorios', icono: 'watch' }
  ]);

  // Cargar productos al iniciar el componente
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setCargando(true);
        const data = await ProductoServices.obtenerTodos();
        setProductos(data);
        setProductosFiltrados(data);
      } catch (err) {
        console.error('Error al cargar productos:', err);
        setError('No se pudieron cargar los productos. Por favor, intente más tarde.');
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, []);

  // Filtrar productos cuando cambia la búsqueda
  useEffect(() => {
    if (busqueda.trim() === '') {
      setProductosFiltrados(productos);
    } else {
      const filtered = productos.filter(
        producto => 
          producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          producto.codigoIdentificacion.toLowerCase().includes(busqueda.toLowerCase())
      );
      setProductosFiltrados(filtered);
    }
  }, [busqueda, productos]);

  // Buscar productos en la API
  const buscarProductos = async () => {
    if (busqueda.trim() === '') return;

    try {
      setCargando(true);
      const resultados = await ProductoServices.buscarPorNombre(busqueda);
      setProductosFiltrados(resultados);
    } catch (err) {
      console.error('Error al buscar productos:', err);
      setError('Error al realizar la búsqueda');
    } finally {
      setCargando(false);
    }
  };

  // Función para buscar producto por código (para escaneo de código de barras)
  const buscarPorCodigo = async (codigo: string) => {
    if (!codigo) return;
    
    try {
      setCargando(true);
      const producto = await ProductoServices.obtenerPorCodigo(codigo);
      
      // Obtener precio del producto
      const precios = await ProductoServices.obtenerPrecios(producto.idProducto!);
      if (precios.length > 0) {
        agregarProductoAVenta(producto, precios[0]);
      } else {
        setError(`El producto ${producto.nombre} no tiene precios definidos`);
      }
    } catch (err) {
      console.error('Error al buscar producto por código:', err);
      setError('No se encontró el producto con ese código');
    } finally {
      setCargando(false);
    }
  };

  // Función para añadir un producto a la venta
  const agregarProductoAVenta = async (producto: Producto, precio: Precio) => {
    // Verificar si el producto ya está en la lista
    const productoExistente = productosSeleccionados.find(
      item => item.idProducto === producto.idProducto
    );

    if (productoExistente) {
      // Actualizar cantidad si ya existe
      const actualizados = productosSeleccionados.map(item => {
        if (item.idProducto === producto.idProducto) {
          const nuevaCantidad = item.cantidad + 1;
          return {
            ...item,
            cantidad: nuevaCantidad,
            total: nuevaCantidad * item.precio
          };
        }
        return item;
      });
      setProductosSeleccionados(actualizados);
    } else {
      // Añadir nuevo producto
      // Extraer talla del nombre o categoría (esto dependería de tu estructura de datos)
      const talla = producto.nombre.includes('M') ? 'M' : 
                   producto.nombre.includes('L') ? 'L' : 
                   producto.nombre.includes('S') ? 'S' : 
                   producto.nombre.includes('XL') ? 'XL' : '';
      
      const nuevoProducto: ProductoVenta = {
        idProducto: producto.idProducto!,
        codigo: producto.codigoIdentificacion,
        descripcion: producto.nombre,
        talla,
        cantidad: 1,
        precio: precio.precioUnitario,
        total: precio.precioUnitario
      };
      
      setProductosSeleccionados([...productosSeleccionados, nuevoProducto]);
    }
  };

  // Eliminar producto de la venta
  const eliminarProducto = (idProducto: number) => {
    setProductosSeleccionados(
      productosSeleccionados.filter(item => item.idProducto !== idProducto)
    );
  };

  // Actualizar cantidad de un producto
  const actualizarCantidad = (idProducto: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarProducto(idProducto);
      return;
    }

    const actualizados = productosSeleccionados.map(item => {
      if (item.idProducto === idProducto) {
        return {
          ...item,
          cantidad: nuevaCantidad,
          total: nuevaCantidad * item.precio
        };
      }
      return item;
    });
    
    setProductosSeleccionados(actualizados);
  };

  // Calcular totales
  const subtotal = productosSeleccionados.reduce((acc, item) => acc + item.total, 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  // Procesar la venta
  const handleProcesarVenta = async () => {
    if (!cliente) {
      setError('Por favor ingrese el cliente');
      return;
    }

    if (!metodoPago) {
      setError('Por favor seleccione un método de pago');
      return;
    }

    if (productosSeleccionados.length === 0) {
      setError('No hay productos seleccionados para la venta');
      return;
    }

    setCargando(true);
    try {
      // Aquí iría la lógica para enviar la venta a la API
      // Estructura de datos ejemplo para enviar al backend:
      const datosVenta = {
        cliente,
        codigoMayorista: codigoMayorista || null,
        metodoPago,
        productos: productosSeleccionados.map(item => ({
          idProducto: item.idProducto,
          cantidad: item.cantidad,
          precioUnitario: item.precio
        })),
        subtotal,
        igv,
        total
      };

      // Llamada a API (simulada por ahora)
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Datos de venta a enviar:', datosVenta);
      
      // Resetear formulario después de procesar la venta
      setCliente('');
      setCodigoMayorista('');
      setBusqueda('');
      setProductosSeleccionados([]);
      setMetodoPago('');
      setError(null);
      
      alert('Venta procesada correctamente');
    } catch (err) {
      console.error('Error al procesar la venta:', err);
      setError('Error al procesar la venta. Por favor, intente nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  // Renderizar icono para categoría
  const renderIconoCategoria = (nombreIcono: string) => {
    switch (nombreIcono) {
      case 'tshirt':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'socks':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
          </svg>
        );
      case 'pants':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        );
    }
  };

  return (
    <div className="h-full">
      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-600 text-sm">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Encabezado con información del cliente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center">
          <label className="mb-2 sm:mb-0 sm:mr-3 font-medium">Cliente:</label>
          <input
            type="text"
            className="flex-grow px-3 py-2 border rounded-md"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            placeholder="Ingrese nombre del cliente"
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end">
          <label className="mb-2 sm:mb-0 sm:mr-3 font-medium">Código mayorista:</label>
          <div className="flex">
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-l-md"
              value={codigoMayorista}
              onChange={(e) => setCodigoMayorista(e.target.value)}
              placeholder="Opcional"
            />
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md"
              onClick={() => {/* Aquí iría la lógica para verificar el código mayorista */}}
            >
              Ingresar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Sección de productos */}
        <div className="lg:col-span-7 bg-white rounded-lg shadow-md">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Productos</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-4">
              {categorias.map((categoria, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center cursor-pointer hover:bg-gray-100 p-2 rounded-md"
                  onClick={() => {
                    /* Aquí iría la lógica para filtrar por categoría */
                  }}
                >
                  <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center mb-2">
                    {renderIconoCategoria(categoria.icono)}
                  </div>
                  <span className="text-xs text-center">{categoria.nombre}</span>
                </div>
              ))}
            </div>

            <div className="relative mb-4">
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border rounded-md"
                placeholder="Buscar producto por nombre o código..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    buscarProductos();
                  }
                }}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600"
                onClick={buscarProductos}
              >
                Buscar
              </button>
            </div>

            {/* Lista de productos filtrados */}
            <div className="overflow-y-auto max-h-64">
              {cargando ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : productosFiltrados.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {productosFiltrados.map(producto => (
                    <div 
                      key={producto.idProducto} 
                      className="border rounded-md p-3 cursor-pointer hover:bg-gray-50"
                      onClick={async () => {
                        try {
                          const precios = await ProductoServices.obtenerPrecios(producto.idProducto!);
                          if (precios.length > 0) {
                            agregarProductoAVenta(producto, precios[0]);
                          } else {
                            setError(`El producto ${producto.nombre} no tiene precios definidos`);
                          }
                        } catch (err) {
                          console.error('Error al obtener precios:', err);
                          setError('Error al obtener precios del producto');
                        }
                      }}
                    >
                      <p className="font-medium text-sm">{producto.nombre}</p>
                      <p className="text-xs text-gray-500">Código: {producto.codigoIdentificacion}</p>
                      <p className="text-xs text-gray-500">Stock: {producto.cantidad}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  {busqueda ? 'No se encontraron productos con esa búsqueda' : 'No hay productos disponibles'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sección de tabla de productos */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-white rounded-lg shadow-md flex-1">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Resumen de venta</h2>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                      <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Talla</th>
                      <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Cant.</th>
                      <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio</th>
                      <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productosSeleccionados.map((producto) => (
                      <tr key={producto.idProducto} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">{producto.codigo}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">{producto.descripcion}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-center text-gray-500">{producto.talla}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-center">
                          <div className="flex items-center justify-center">
                            <button 
                              className="text-gray-500 hover:text-gray-700"
                              onClick={() => actualizarCantidad(producto.idProducto, producto.cantidad - 1)}
                            >
                              -
                            </button>
                            <span className="mx-2 w-6 text-center">{producto.cantidad}</span>
                            <button 
                              className="text-gray-500 hover:text-gray-700"
                              onClick={() => actualizarCantidad(producto.idProducto, producto.cantidad + 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-right text-gray-500">S/{producto.precio.toFixed(2)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-right text-gray-500">S/{producto.total.toFixed(2)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-center">
                          <button 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => eliminarProducto(producto.idProducto)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {productosSeleccionados.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-4 text-center text-sm text-gray-500">
                          No hay productos agregados a la venta
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Subtotal:</span>
                  <span className="text-sm text-gray-900">S/{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">IGV (18%):</span>
                  <span className="text-sm text-gray-900">S/{igv.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-lg">Total:</span>
                  <span className="text-lg">S/{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Métodos de pago</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    className={`flex justify-center px-4 py-2 border rounded-md ${metodoPago === 'efectivo' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-700'}`}
                    onClick={() => setMetodoPago('efectivo')}
                  >
                    Efectivo
                  </button>
                  <button
                    className={`flex justify-center px-4 py-2 border rounded-md ${metodoPago === 'tarjeta' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-700'}`}
                    onClick={() => setMetodoPago('tarjeta')}
                  >
                    Tarjeta
                  </button>
                  <button
                    className={`flex justify-center px-4 py-2 border rounded-md ${metodoPago === 'yape' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-700'}`}
                    onClick={() => setMetodoPago('yape')}
                  >
                    Yape
                  </button>
                  <button
                    className={`flex justify-center px-4 py-2 border rounded-md ${metodoPago === 'plin' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-700'}`}
                    onClick={() => setMetodoPago('plin')}
                  >
                    Plin
                  </button>
                </div>
              </div>

              <button
                onClick={handleProcesarVenta}
                disabled={cargando || !metodoPago || !cliente || productosSeleccionados.length === 0}
                className={`w-full py-3 rounded-md font-medium ${cargando || !metodoPago || !cliente || productosSeleccionados.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                {cargando ? 'Procesando...' : 'Procesar Venta'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VentasPanel;