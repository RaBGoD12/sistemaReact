
import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, AlertCircle, Printer, ShoppingCart, CreditCard, Smartphone, DollarSign, QrCode as QrCodeIcon, CheckCircle, Loader2, Ticket } from 'lucide-react';
import QRCodeStyling from 'qrcode.react';
import {ProductoService} from '../../services/ProductoServices';
import type { Producto, ProductoVenta } from '../../interfaces/Producto';


const VentasPanel = () => {
  // --------------------------------------------------------------------------------------------
  // A. ESTADO DEL COMPONENTE
  // --------------------------------------------------------------------------------------------
  const [busqueda, setBusqueda] = useState('');
  const [cliente, setCliente] = useState('');
  const [codigoMayoristaInput, setCodigoMayoristaInput] = useState('');
  const [infoMayorista, setInfoMayorista] = useState<{ valido: boolean; mensaje: string; descuento?: number } | null>(null);

  const [productosCargados, setProductosCargados] = useState<Producto[]>([]);
  const [productosFiltradosVista, setProductosFiltradosVista] = useState<Producto[]>([]);
  const [productosSeleccionadosVenta, setProductosSeleccionadosVenta] = useState<ProductoVenta[]>([]);
  
  const [metodoPago, setMetodoPago] = useState('');
  
  const [cargandoProductosIniciales, setCargandoProductosIniciales] = useState(true);
  const [cargandoBusquedaAccion, setCargandoBusquedaAccion] = useState(false);
  const [cargandoProcesoVenta, setCargandoProcesoVenta] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [mensajeInfoVista, setMensajeInfoVista] = useState<string | null>(null);

  const [mostrarModalQR, setMostrarModalQR] = useState(false);
  const [qrDataModal, setQrDataModal] = useState({ url: '', tipo: '' });
  const [mostrarModalBoleta, setMostrarModalBoleta] = useState(false);
  const [datosVentaParaBoleta, setDatosVentaParaBoleta] = useState<any>(null);

  // --------------------------------------------------------------------------------------------
  // B. EFECTOS (useEffect)
  // --------------------------------------------------------------------------------------------
  useEffect(() => {
    const cargarTodosLosProductos = async () => {
      try {
        setCargandoProductosIniciales(true);
        setErrorGlobal(null);
        setMensajeInfoVista("Cargando productos...");
        const data = await ProductoService.obtenerTodos();
        setProductosCargados(data);
        setProductosFiltradosVista(data); 
        if (data.length === 0) { 
          setMensajeInfoVista("No hay productos disponibles o el servicio no está conectado.");
        } else {
          setMensajeInfoVista(null);
        }
      } catch (err: any) {
        console.error('Error en cargarTodosLosProductos:', err);
        setErrorGlobal(err.message || 'No se pudieron cargar los productos.');
        setMensajeInfoVista(null);
      } finally {
        setCargandoProductosIniciales(false);
      }
    };
    cargarTodosLosProductos();
  }, []); 

  useEffect(() => {
    if (!cargandoProductosIniciales && !cargandoBusquedaAccion) { 
      if (busqueda.trim() === '') {
        setProductosFiltradosVista(productosCargados); 
        setMensajeInfoVista(null);
      } else {
        const terminoLower = busqueda.toLowerCase();
        const filtrados = productosCargados.filter(
          p => p.nombre.toLowerCase().includes(terminoLower) ||
               p.codigoIdentificacion.toLowerCase().includes(terminoLower)
        );
        setProductosFiltradosVista(filtrados);
        if (filtrados.length === 0 && busqueda.trim() !== '') { 
            setMensajeInfoVista(`No hay coincidencias locales para "${busqueda}". Prueba "Buscar DB".`);
        } else if (filtrados.length > 0 || busqueda.trim() === '') { 
            setMensajeInfoVista(null);
        }
      }
    }
  }, [busqueda, productosCargados, cargandoProductosIniciales, cargandoBusquedaAccion]);

  // --------------------------------------------------------------------------------------------
  // C. MANEJADORES DE LÓGICA DE PRODUCTOS Y VENTA
  // --------------------------------------------------------------------------------------------
  const handleBuscarEnServicio = async () => {
    const terminoBusqueda = busqueda.trim();
    if (terminoBusqueda === '') {
      setProductosFiltradosVista(productosCargados); 
      setMensajeInfoVista(null);
      return;
    }
    try {
      setCargandoBusquedaAccion(true);
      setErrorGlobal(null);
      setMensajeInfoVista(`Buscando "${terminoBusqueda}" en DB...`);
      const resultados = await ProductoService.buscarPorNombreOCodigo(terminoBusqueda);
      setProductosFiltradosVista(resultados); 
      if (resultados.length === 0) {
        setMensajeInfoVista(`No se encontraron productos para "${terminoBusqueda}" en la base de datos.`);
      } else {
        setMensajeInfoVista(null);
      }
    } catch (err: any) {
      console.error('Error en handleBuscarEnServicio:', err);
      setErrorGlobal(err.message || 'Error al buscar en la base de datos.');
      setMensajeInfoVista(null);
    } finally {
      setCargandoBusquedaAccion(false);
    }
  };
  
  const handleBuscarPorCodigoExacto = useCallback(async (codigoScaneado: string) => {
    if (!codigoScaneado.trim()) return;
    try {
      setCargandoBusquedaAccion(true);
      setErrorGlobal(null);
      setMensajeInfoVista(`Procesando código "${codigoScaneado}"...`);
      const productoEncontrado = await ProductoService.obtenerPorCodigoExacto(codigoScaneado.trim());
      
      if (productoEncontrado) {
        // El precio ya está en productoEncontrado.precioUnitario
        let precioFinal = productoEncontrado.precioUnitario;
        if (infoMayorista?.valido && infoMayorista.descuento) {
            precioFinal = precioFinal * (1 - infoMayorista.descuento);
        }
        agregarProductoAVentaInterno(productoEncontrado, precioFinal);
        setBusqueda(''); 
        setMensajeInfoVista(`${productoEncontrado.nombre} agregado.`);
        setTimeout(() => setMensajeInfoVista(null), 2000);
      } else {
        setErrorGlobal(`No se encontró producto con código "${codigoScaneado}".`);
        setMensajeInfoVista(null);
      }
    } catch (err: any) {
      console.error('Error en handleBuscarPorCodigoExacto:', err);
      setErrorGlobal(err.message || `Error al procesar código "${codigoScaneado}".`);
      setMensajeInfoVista(null);
    } finally {
      setCargandoBusquedaAccion(false);
    }
  }, [infoMayorista]); 

  const agregarProductoAVentaInterno = (producto: Producto, precioAplicado: number) => {
    setErrorGlobal(null);
    if (producto.cantidad <= 0) {
      setErrorGlobal(`El producto ${producto.nombre} está agotado.`);
      return;
    }

    const productoExistente = productosSeleccionadosVenta.find(item => item.idProducto === producto.idProducto);
    
    if (productoExistente) {
      if (productoExistente.cantidad >= producto.cantidad) {
        setErrorGlobal(`No hay más stock de ${producto.nombre}. Stock: ${producto.cantidad}. En carrito: ${productoExistente.cantidad}.`);
        return;
      }
      setProductosSeleccionadosVenta(prev => prev.map(item => 
        item.idProducto === producto.idProducto 
          ? { ...item, cantidad: item.cantidad + 1, total: (item.cantidad + 1) * item.precio } 
          : item
      ));
    } else {
      setProductosSeleccionadosVenta(prev => [...prev, {
        idProducto: producto.idProducto!,
        codigo: producto.codigoIdentificacion,
        descripcion: producto.nombre, // Usar el nombre del producto como descripción
        talla: producto.talla || 'Única', // Usar la talla del producto o 'Única'
        cantidad: 1,
        precio: precioAplicado, 
        total: precioAplicado
      }]);
    }
  };

  const handleSeleccionarProductoDeLista = (producto: Producto) => {
    // El precio ya está en producto.precioUnitario
    let precioFinal = producto.precioUnitario;
    if (infoMayorista?.valido && infoMayorista.descuento) {
        precioFinal = precioFinal * (1 - infoMayorista.descuento);
         setMensajeInfoVista(`Descuento mayorista del ${(infoMayorista.descuento * 100).toFixed(0)}% aplicado a ${producto.nombre}.`);
         setTimeout(() => setMensajeInfoVista(null), 3500);
    }
    agregarProductoAVentaInterno(producto, precioFinal);
  };

  const handleEliminarProductoDeVenta = (idProducto: number) => {
    setProductosSeleccionadosVenta(prev => prev.filter(item => item.idProducto !== idProducto));
  };

  const handleActualizarCantidadEnVenta = (idProducto: number, nuevaCantidad: number) => {
    const productoOriginal = productosCargados.find(p => p.idProducto === idProducto) || productosFiltradosVista.find(p => p.idProducto === idProducto);
    if (!productoOriginal) {
      setErrorGlobal("Error crítico: Producto no encontrado para actualizar stock.");
      return;
    }
    if (nuevaCantidad <= 0) {
      handleEliminarProductoDeVenta(idProducto);
      return;
    }
    if (nuevaCantidad > productoOriginal.cantidad) {
      setErrorGlobal(`Stock máximo para ${productoOriginal.nombre} es ${productoOriginal.cantidad}.`);
      return; 
    }
    setErrorGlobal(null);
    setProductosSeleccionadosVenta(prev => prev.map(item => 
      item.idProducto === idProducto 
        ? { ...item, cantidad: nuevaCantidad, total: nuevaCantidad * item.precio } 
        : item
    ));
  };

  const subtotalVenta = productosSeleccionadosVenta.reduce((acc, item) => acc + item.total, 0);
  const igvVenta = subtotalVenta * 0.18; 
  const totalGeneralVenta = subtotalVenta + igvVenta;

  // --------------------------------------------------------------------------------------------
  // D. MANEJADORES DE LÓGICA DE PAGO Y FINALIZACIÓN
  // --------------------------------------------------------------------------------------------
  const handleVerificarCodigoMayorista = async () => {
    if (!codigoMayoristaInput.trim()) {
        setErrorGlobal("Ingrese un código mayorista.");
        setInfoMayorista(null);
        return;
    }
    setCargandoBusquedaAccion(true); 
    setErrorGlobal(null);
    try {
        const resultado = await ProductoService.verificarCodigoMayorista(codigoMayoristaInput.trim());
        setInfoMayorista(resultado);
        if (resultado.valido) {
            setErrorGlobal(null); 
            setMensajeInfoVista(resultado.mensaje);
            setTimeout(() => setMensajeInfoVista(null), 3000);
            // Si hay productos en el carrito, podríamos ofrecer recalcular sus precios aquí.
            // Por simplicidad, el descuento se aplicará a los nuevos productos agregados.
        } else {
            setErrorGlobal(resultado.mensaje); 
        }
    } catch (err: any) {
        setErrorGlobal(err.message || "Error al verificar código mayorista.");
        setInfoMayorista(null);
    } finally {
        setCargandoBusquedaAccion(false);
    }
  };
  
  const handleProcesarVentaFinal = async () => {
    setErrorGlobal(null);
    if (!cliente.trim()) { setErrorGlobal('Ingrese el nombre del cliente.'); return; }
    if (!metodoPago) { setErrorGlobal('Seleccione un método de pago.'); return; }
    if (productosSeleccionadosVenta.length === 0) { setErrorGlobal('Agregue productos a la venta.'); return; }

    setCargandoProcesoVenta(true);

    if (metodoPago === 'yape' || metodoPago === 'plin') {
      const qrContent = `TipoPago: ${metodoPago.toUpperCase()}\nMonto: S/${totalGeneralVenta.toFixed(2)}\nCliente: ${cliente}\nReferencia: VTA-${Date.now()}`;
      setQrDataModal({ url: qrContent, tipo: metodoPago.toUpperCase() });
      setMostrarModalQR(true);
      setCargandoProcesoVenta(false); 
    } else { 
      await ejecutarFinalizacionVenta();
    }
  };
  
  const ejecutarFinalizacionVenta = async () => {
    setMostrarModalQR(false); 
    setCargandoProcesoVenta(true); 
    setErrorGlobal(null);

    const datosVenta = {
      cliente,
      codigoMayorista: infoMayorista?.valido ? codigoMayoristaInput.trim() : null,
      descuentoAplicado: infoMayorista?.valido ? infoMayorista.descuento : null,
      metodoPago,
      productos: productosSeleccionadosVenta.map(item => ({
        idProducto: item.idProducto,
        descripcion: item.descripcion, 
        cantidad: item.cantidad,
        precioUnitarioAplicado: item.precio, 
        totalParcial: item.total,
      })),
      subtotal: subtotalVenta,
      igv: igvVenta,
      totalGeneral: totalGeneralVenta,
      fechaHora: new Date().toISOString(), 
    };

    try {
      // TODO: LLAMADA REAL AL BACKEND PARA REGISTRAR LA VENTA
      console.log('Enviando datos de venta final al backend (simulado):', datosVenta);
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      const productosActualizados = productosCargados.map(p => {
        const vendido = productosSeleccionadosVenta.find(ps => ps.idProducto === p.idProducto);
        return vendido ? { ...p, cantidad: p.cantidad - vendido.cantidad } : p;
      });
      setProductosCargados(productosActualizados);
      
      setDatosVentaParaBoleta(datosVenta); 
      setMostrarModalBoleta(true);
      
      setCliente('');
      setCodigoMayoristaInput('');
      setInfoMayorista(null);
      setBusqueda('');
      setProductosSeleccionadosVenta([]);
      setMetodoPago('');
      
    } catch (err: any) {
      console.error('Error al ejecutar finalización de venta:', err);
      setErrorGlobal(err.message || 'Error crítico al registrar la venta. Contacte a soporte.');
    } finally {
      setCargandoProcesoVenta(false);
    }
  };
  
  const handleImprimirBoleta = () => { 
    if (!datosVentaParaBoleta) return;
    const { cliente, productos: productosBoleta, subtotal, igv, totalGeneral, fechaHora, metodoPago: mp } = datosVentaParaBoleta;
    const fechaFormateada = new Date(fechaHora).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short'});
    
    let itemsHtml = productosBoleta.map((p: any) => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 5px; font-size:10px;">${p.cantidad}</td>
        <td style="border: 1px solid #ddd; padding: 5px; font-size:10px;">${p.descripcion}</td>
        <td style="border: 1px solid #ddd; padding: 5px; text-align: right; font-size:10px;">S/${p.precioUnitarioAplicado.toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 5px; text-align: right; font-size:10px;">S/${p.totalParcial.toFixed(2)}</td>
      </tr>`).join('');

    const boletaHtml = `
      <html><head><title>Boleta de Venta</title><style>
        body { font-family: 'Arial Narrow', Arial, sans-serif; margin: 0; padding:10px; font-size: 11px; width: 280px; }
        .container { border: 1px solid #555; padding: 10px; }
        h2 { text-align: center; margin: 0 0 8px 0; font-size: 14px; }
        p { margin: 3px 0; } strong { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 8px 0; }
        th, td { text-align: left; padding: 3px; font-size: 10px;}
        .text-right { text-align: right; }
        .total-row td { font-weight: bold; border-top: 1px dashed #333; padding-top: 4px;}
        hr { border: none; border-top: 1px dashed #777; margin: 8px 0; }
      </style></head><body><div class="container">
        <h2>BOLETA DE VENTA</h2>
        <p><strong>Fecha:</strong> ${fechaFormateada}</p>
        <p><strong>Cliente:</strong> ${cliente || 'Varios'}</p>
        <p><strong>Método Pago:</strong> ${mp.charAt(0).toUpperCase() + mp.slice(1)}</p>
        <hr/>
        <table><thead><tr>
          <th>Cant.</th><th>Descripción</th><th class="text-right">P.U.</th><th class="text-right">Total</th>
        </tr></thead><tbody>${itemsHtml}</tbody></table>
        <hr/>
        <table>
          <tr><td>Subtotal:</td><td class="text-right">S/${subtotal.toFixed(2)}</td></tr>
          <tr><td>IGV (18%):</td><td class="text-right">S/${igvVenta.toFixed(2)}</td></tr>
          <tr class="total-row"><td>TOTAL:</td><td class="text-right">S/${totalGeneral.toFixed(2)}</td></tr>
        </table>
        <p style="text-align:center; font-size:9px; margin-top:10px;">¡Gracias por su compra!</p>
      </div><script>setTimeout(() => { window.print(); /* window.close(); */ }, 200);</script></body></html>`;
    
    const boletaWindow = window.open('', '_blank', 'width=320,height=500,scrollbars=yes,resizable=yes');
    boletaWindow?.document.write(boletaHtml);
    boletaWindow?.document.close();
    setMostrarModalBoleta(false);
  };

  // --------------------------------------------------------------------------------------------
  // E. DEFINICIÓN DE MÉTODOS DE PAGO (Para la UI)
  // --------------------------------------------------------------------------------------------
  const paymentMethods = [
    { id: 'efectivo', name: 'Efectivo', icon: <DollarSign size={18} className="mr-1 sm:mr-2"/> },
    { id: 'tarjeta', name: 'Tarjeta', icon: <CreditCard size={18} className="mr-1 sm:mr-2"/> },
    { id: 'yape', name: 'Yape', icon: <Smartphone size={18} className="mr-1 sm:mr-2"/> },
    { id: 'plin', name: 'Plin', icon: <Smartphone size={18} className="mr-1 sm:mr-2"/> },
  ];

  // --------------------------------------------------------------------------------------------
  // F. RENDERIZADO DEL COMPONENTE (JSX)
  // --------------------------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-100 p-2 sm:p-4">
      {/* Notificación Global de Errores */}
      {errorGlobal && (
        <div className="fixed top-4 right-4 z-[100] mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm shadow-lg rounded-md w-auto max-w-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-red-500 flex-shrink-0" />
            <span className="flex-grow">{errorGlobal}</span>
            <button onClick={() => setErrorGlobal(null)} className="ml-2 text-red-500 hover:text-red-700 flex-shrink-0">
              <X size={18} />
            </button>
          </div>
        </div>
      )}
      {/* Notificación Global de Información */}
      {mensajeInfoVista && ( 
         <div className="fixed top-16 right-4 z-[100] mb-4 p-3 bg-blue-100 border-l-4 border-blue-500 text-blue-700 text-sm shadow-lg rounded-md w-auto max-w-md animate-pulse">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0" /> 
            <span className="flex-grow">{mensajeInfoVista}</span>
            <button onClick={() => setMensajeInfoVista(null)} className="ml-2 text-blue-500 hover:text-blue-700 flex-shrink-0">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* MODALES */}
      {mostrarModalQR && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-2">Pagar con {qrDataModal.tipo}</h3>
            <p className="text-gray-600 mb-4">Escanee el código QR para pagar <span className="font-bold">S/{totalGeneralVenta.toFixed(2)}</span>.</p>
            <div className="flex justify-center my-4"><QRCodeStyling value={qrDataModal.url} size={200} level="H" /></div>
            <p className="text-xs text-gray-500 mb-4">Este es un QR de demostración. En producción, el backend generaría un QR específico o se usaría la app del POS.</p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setMostrarModalQR(false)} className="w-1/2 py-2 px-4 border rounded-md hover:bg-gray-100">Cancelar</button>
              <button 
                onClick={ejecutarFinalizacionVenta} 
                disabled={cargandoProcesoVenta}
                className="w-1/2 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center">
                {cargandoProcesoVenta ? <Loader2 className="animate-spin mr-2"/> : <CheckCircle className="mr-2"/>} Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalBoleta && datosVentaParaBoleta && (
         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <div className="text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">¡Venta Registrada Exitosamente!</h3>
                    <p className="text-gray-600 mb-1">Cliente: <span className="font-medium">{datosVentaParaBoleta.cliente}</span></p>
                    <p className="text-gray-600 mb-4">Total Pagado: <span className="font-bold text-lg">S/{datosVentaParaBoleta.totalGeneral.toFixed(2)}</span></p>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button onClick={() => setMostrarModalBoleta(false)} className="w-full sm:w-1/2 py-2.5 px-4 border rounded-md hover:bg-gray-100">Cerrar</button>
                    <button onClick={handleImprimirBoleta} className="w-full sm:w-1/2 py-2.5 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center">
                        <Printer size={18} className="mr-2"/> Imprimir Boleta
                    </button>
                </div>
            </div>
        </div>
      )}
      
      {/* LAYOUT PRINCIPAL DE LA PÁGINA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5 p-3 sm:p-4 bg-white rounded-lg shadow">
        <div>
          <label htmlFor="clienteInput" className="block mb-1 text-sm font-medium text-gray-700">Cliente:</label>
          <input id="clienteInput" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Nombre del cliente (Ej: Juan Pérez)" />
        </div>
        <div className="flex items-end">
          <div className="flex-grow">
            <label htmlFor="codigoMayoristaInput" className="block mb-1 text-sm font-medium text-gray-700">Cód. Mayorista (Opcional):</label>
            <input id="codigoMayoristaInput" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
              value={codigoMayoristaInput} onChange={(e) => setCodigoMayoristaInput(e.target.value)} placeholder="Ej: MAYORISTA2025" />
          </div>
          <button 
            onClick={handleVerificarCodigoMayorista}
            disabled={cargandoBusquedaAccion && !!codigoMayoristaInput} 
            className="px-3 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 h-[42px] flex items-center justify-center disabled:bg-gray-400"
          >
            {cargandoBusquedaAccion && codigoMayoristaInput ? <Loader2 className="animate-spin" size={20}/> : <Ticket size={18}/>}
            <span className="ml-1 hidden sm:inline">Verificar</span>
          </button>
        </div>
        {infoMayorista && ( 
            <div className={`lg:col-span-2 mt-2 text-sm p-2 rounded-md ${infoMayorista.valido ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {infoMayorista.mensaje} {infoMayorista.valido && infoMayorista.descuento ? `(Descuento: ${(infoMayorista.descuento * 100).toFixed(0)}%)` : ''}
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <div className="lg:col-span-7 bg-white rounded-lg shadow-md">
          <div className="p-3 sm:p-4 border-b"><h2 className="text-lg sm:text-xl font-semibold text-gray-800">Buscar Productos</h2></div>
          <div className="p-3 sm:p-4">
            <div className="relative mb-4">
              <input type="text" className="w-full pl-10 pr-24 sm:pr-28 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nombre, código o escanear..." value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && busqueda.trim()) {
                    if (/^[A-Za-z0-9-]{4,}$/.test(busqueda.trim()) && !busqueda.trim().includes(" ")) {
                        handleBuscarPorCodigoExacto(busqueda.trim());
                    } else {
                        handleBuscarEnServicio();
                    }
                  }
                }} />
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs sm:text-sm px-2.5 sm:px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-gray-300"
                onClick={handleBuscarEnServicio} 
                disabled={cargandoBusquedaAccion || !busqueda.trim()}
              >
                {cargandoBusquedaAccion && busqueda ? <Loader2 className="animate-spin" size={16}/> : 'Buscar DB'}
              </button>
            </div>
            <div className="overflow-y-auto max-h-72 sm:max-h-96 border border-gray-200 rounded-md p-2 bg-gray-50 min-h-[200px] flex flex-col">
              {cargandoProductosIniciales ? (
                <div className="flex-grow flex justify-center items-center text-gray-500"><Loader2 className="animate-spin text-indigo-500 mr-2" size={24}/>Cargando lista inicial...</div>
              ) : cargandoBusquedaAccion ? (
                 <div className="flex-grow flex justify-center items-center text-gray-500"><Loader2 className="animate-spin text-indigo-500 mr-2" size={24}/>{mensajeInfoVista || "Buscando..."}</div>
              ) : productosFiltradosVista.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                  {productosFiltradosVista.map(p => (
                    <div key={p.idProducto} className="border bg-white rounded-md p-2 sm:p-3 cursor-pointer hover:shadow-lg hover:border-indigo-500 transition-all"
                      onClick={() => handleSeleccionarProductoDeLista(p)}>
                      <p className="font-medium text-xs sm:text-sm truncate" title={p.nombre}>{p.nombre}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">Código: {p.codigoIdentificacion}</p>
                      <p className={`text-[10px] sm:text-xs font-semibold ${p.cantidad > 5 ? 'text-green-600' : p.cantidad > 0 ? 'text-orange-500' : 'text-red-600'}`}>
                        Stock: {p.cantidad}
                      </p>
                       <p className="text-sm font-semibold text-indigo-600 mt-1">S/{p.precioUnitario.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-grow flex justify-center items-center text-center text-gray-500 p-4">
                    {mensajeInfoVista || "No se encontraron productos. Intente otra búsqueda o verifique la conexión."}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-white rounded-lg shadow-md flex-1 flex flex-col">
            <div className="p-3 sm:p-4 border-b"><h2 className="text-lg sm:text-xl font-semibold text-gray-800">Resumen de Venta</h2></div>
            <div className="p-3 sm:p-4 flex flex-col flex-grow justify-between">
              <div className="overflow-auto max-h-60 sm:max-h-[calc(100vh-580px)] min-h-[150px]"> 
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10"><tr>
                    <th className="px-2 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Descripción</th>
                    <th className="px-1 py-2 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Cant.</th>
                    <th className="px-2 py-2 text-right text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-1 py-2 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase"></th>
                  </tr></thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productosSeleccionadosVenta.map(p => (
                      <tr key={p.idProducto} className="hover:bg-gray-50">
                        <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-700 max-w-[100px] sm:max-w-[150px] truncate" title={p.descripcion}>{p.descripcion}</td>
                        <td className="px-1 py-1.5 whitespace-nowrap text-xs text-center">
                          <div className="flex items-center justify-center">
                            <button className="text-red-600 hover:text-red-800 p-0.5" onClick={() => handleActualizarCantidadEnVenta(p.idProducto, p.cantidad - 1)}>-</button>
                            <span className="mx-1.5 w-5 text-center font-medium">{p.cantidad}</span>
                            <button className="text-green-600 hover:text-green-800 p-0.5" onClick={() => handleActualizarCantidadEnVenta(p.idProducto, p.cantidad + 1)}>+</button>
                          </div>
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-xs text-right font-medium">S/{p.total.toFixed(2)}</td>
                        <td className="px-1 py-1.5 whitespace-nowrap text-xs text-center">
                          <button className="text-red-500 hover:text-red-700" onClick={() => handleEliminarProductoDeVenta(p.idProducto)}><X size={14} /></button>
                        </td>
                      </tr>
                    ))}
                    {productosSeleccionadosVenta.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-400">Agregue productos a la venta.</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="mt-auto pt-3 sm:pt-4"> 
                <div className="border-t border-gray-200 pt-3 sm:pt-4">
                  <div className="flex justify-between mb-1 text-xs sm:text-sm"><span className="font-medium text-gray-600">Subtotal:</span><span className="font-medium">S/{subtotalVenta.toFixed(2)}</span></div>
                  <div className="flex justify-between mb-1 text-xs sm:text-sm"><span className="font-medium text-gray-600">IGV (18%):</span><span className="font-medium">S/{igvVenta.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-base sm:text-lg mt-1.5"><span className="text-gray-800">Total General:</span><span className="text-indigo-600">S/{totalGeneralVenta.toFixed(2)}</span></div>
                </div>
                <div className="mt-3 sm:mt-4">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Métodos de pago</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    {paymentMethods.map(method => (
                      <button key={method.id}
                        className={`flex items-center justify-center text-[10px] sm:text-xs px-1.5 py-1.5 sm:px-2 sm:py-2 border rounded-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 ${metodoPago === method.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg transform scale-105' : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus:ring-indigo-500'}`}
                        onClick={() => setMetodoPago(method.id)}>
                        {method.icon} {method.name}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleProcesarVentaFinal}
                    disabled={cargandoProcesoVenta || !metodoPago || !cliente.trim() || productosSeleccionadosVenta.length === 0}
                    className="w-full py-2.5 sm:py-3 rounded-md font-semibold text-sm sm:text-base bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
                    {cargandoProcesoVenta ? <Loader2 className="animate-spin mr-2" size={20}/> : null}
                    {cargandoProcesoVenta ? 'Procesando Venta...' : 'Procesar y Finalizar Venta'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VentasPanel;