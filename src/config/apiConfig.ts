export const API_BASE_URL = 'http://localhost:8080'; // URL base de la API

// Rutas de Autenticación
export const RUTAS_AUTENTICACION = {
  INICIAR_SESION: `${API_BASE_URL}/api/v1/autenticacion/signin`,
  REGISTRAR_ADMIN: `${API_BASE_URL}/api/v1/autenticacion/signup/createAdmin`,
};

// Rutas de Usuarios
export const RUTAS_USUARIOS = {
  BASE: `${API_BASE_URL}/api/v1/user`,
  CREAR: `${API_BASE_URL}/api/v1/user/createUser`,
  POR_ID: (id: number) => `${API_BASE_URL}/api/v1/user/${id}`, // Para actualizar
  DESHABILITAR: (id: number) => `${API_BASE_URL}/api/v1/user/deshabilitar/${id}`,
  HABILITAR: (id: number) => `${API_BASE_URL}/api/v1/user/habilitar/${id}`,
};

// Rutas de Productos
export const RUTAS_PRODUCTOS = {
  BASE: `${API_BASE_URL}/productos`,
  POR_ID: (id: number) => `${API_BASE_URL}/productos/${id}`,
  POR_CATEGORIA: (categoria: string) => `${API_BASE_URL}/productos/categoria/${encodeURIComponent(categoria)}`,
  POR_CODIGO: (codigo: string) => `${API_BASE_URL}/productos/codigo/${encodeURIComponent(codigo)}`,
  POR_NOMBRE: (nombre: string) => `${API_BASE_URL}/productos/nombre/${encodeURIComponent(nombre)}`,
  POR_PROVEEDOR: (proveedor: string) => `${API_BASE_URL}/productos/distribuidor/${encodeURIComponent(proveedor)}`, // El backend usa 'distribuidor'
  // PRECIOS: (idProducto: number) => `${API_BASE_URL}/productos/${idProducto}/precios`, // Descomentar si tienes este endpoint
};

// Rutas de Categorías
export const RUTAS_CATEGORIAS = {
  BASE: `${API_BASE_URL}/api/categorias`,
  POR_ID: (id: number) => `${API_BASE_URL}/api/categorias/${id}`,
  PRINCIPALES: `${API_BASE_URL}/api/categorias/principales`,
  SUBCATEGORIAS: (idPadre: number) => `${API_BASE_URL}/api/categorias/${idPadre}/subcategorias`,
  ARBOL: `${API_BASE_URL}/api/categorias-tree`, // Para ArbolDeCategoriasController
  CREAR_EN_ARBOL: `${API_BASE_URL}/api/categorias-tree`, // POST a /api/categorias-tree
  BUSCAR: (nombre: string) => `${API_BASE_URL}/api/categorias/buscar?nombre=${encodeURIComponent(nombre)}`,
  CREAR_SUBCATEGORIA: (idPadre: number) => `${API_BASE_URL}/api/categorias/${idPadre}/subcategorias`, // POST
  MOVER: (id: number) => `${API_BASE_URL}/api/categorias/${id}/mover`, // PATCH
};

// Rutas de Ventas
export const RUTAS_VENTAS = {
  BASE: `${API_BASE_URL}/ventas`,
  POR_ID: (id: number) => `${API_BASE_URL}/ventas/${id}`,
  DETALLES: (id: number) => `${API_BASE_URL}/ventas/${id}/detalles`,
  POR_FECHA: (fecha: string) => `${API_BASE_URL}/ventas/fecha/${fecha}`,
  POR_CLIENTE: (idCliente: number) => `${API_BASE_URL}/ventas/cliente/${idCliente}`,
};

// Rutas de Proveedores (Distribuidores en tu backend)
export const RUTAS_PROVEEDORES = {
  BASE: `${API_BASE_URL}/distribuidores`,
  POR_ID: (id: number) => `${API_BASE_URL}/distribuidores/${id}`,
  POR_NOMBRE: (nombre: string) => `${API_BASE_URL}/distribuidores/nombre/${encodeURIComponent(nombre)}`,
};

// Rutas de Clientes
export const RUTAS_CLIENTES = {
  BASE: `${API_BASE_URL}/api/clientes`,
  POR_ID: (id: number) => `${API_BASE_URL}/api/clientes/${id}`,
  POR_DOCUMENTO: (numeroDocumento: string) => `${API_BASE_URL}/api/clientes/documento/${encodeURIComponent(numeroDocumento)}`,
};

// Rutas de Métodos de Pago
export const RUTAS_METODOS_PAGO = {
  BASE: `${API_BASE_URL}/metodos-pago`, // Asumiendo un endpoint base, ajusta si es diferente
  POR_ID: (id: number) => `${API_BASE_URL}/metodos-pago/${id}`,
};

