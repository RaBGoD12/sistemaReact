// URL base de la API
export const API_BASE_URL = 'http://localhost:8080';

// Rutas de Autenticación
export const AUTH_ROUTES = {
  SIGNIN: `${API_BASE_URL}/api/v1/autenticacion/signin`,
  SIGNUP_ADMIN: `${API_BASE_URL}/api/v1/autenticacion/signup/createAdmin`,
};

// Rutas de Usuarios
export const USER_ROUTES = {
  BASE: `${API_BASE_URL}/api/v1/user`,
  CREATE: `${API_BASE_URL}/api/v1/user/createUser`,
  DISABLE: (id: number) => `${API_BASE_URL}/api/v1/user/deshabilitar/${id}`,
  ENABLE: (id: number) => `${API_BASE_URL}/api/v1/user/habilitar/${id}`,
  UPDATE: (id: number) => `${API_BASE_URL}/api/v1/user/${id}`,
};

// Rutas de Productos
export const PRODUCT_ROUTES = {
  BASE: `${API_BASE_URL}/productos`,
  BY_ID: (id: number) => `${API_BASE_URL}/productos/${id}`,
  BY_CATEGORY: (categoria: string) => `${API_BASE_URL}/productos/categoria/${categoria}`,
  BY_CODE: (codigo: string) => `${API_BASE_URL}/productos/codigo/${codigo}`,
  BY_NAME: (nombre: string) => `${API_BASE_URL}/productos/nombre/${nombre}`,
  BY_DISTRIBUTOR: (distribuidor: string) => `${API_BASE_URL}/productos/distribuidor/${distribuidor}`,
  PRICES: (idProducto: number) => `${API_BASE_URL}/productos/${idProducto}/precios`,
};

// Rutas de Categorías
export const CATEGORY_ROUTES = {
  BASE: `${API_BASE_URL}/api/categorias`,
  BY_ID: (id: number) => `${API_BASE_URL}/api/categorias/${id}`,
  MAIN: `${API_BASE_URL}/api/categorias/principales`,
  SUBCATEGORIES: (id: number) => `${API_BASE_URL}/api/categorias/${id}/subcategorias`,
  TREE: `${API_BASE_URL}/api/categorias-tree`,
  SEARCH: (nombre: string) => `${API_BASE_URL}/api/categorias/buscar?nombre=${nombre}`,
  CREATE_SUBCATEGORY: (idPadre: number) => `${API_BASE_URL}/api/categorias/${idPadre}/subcategorias`,
  MOVE: (id: number) => `${API_BASE_URL}/api/categorias/${id}/mover`,
};

// Rutas de Ventas
export const SALES_ROUTES = {
  BASE: `${API_BASE_URL}/ventas`,
  BY_ID: (id: number) => `${API_BASE_URL}/ventas/${id}`,
  DETAILS: (id: number) => `${API_BASE_URL}/ventas/${id}/detalles`,
  BY_DATE: (fecha: string) => `${API_BASE_URL}/ventas/fecha/${fecha}`,
  BY_CLIENT: (idCliente: number) => `${API_BASE_URL}/ventas/cliente/${idCliente}`,
};

// Rutas de Distribuidores
export const DISTRIBUTOR_ROUTES = {
  BASE: `${API_BASE_URL}/distribuidores`,
  BY_ID: (id: number) => `${API_BASE_URL}/distribuidores/${id}`,
  BY_NAME: (nombre: string) => `${API_BASE_URL}/distribuidores/nombre/${nombre}`,
};

// Rutas de Clientes
export const CLIENT_ROUTES = {
  BASE: `${API_BASE_URL}/clientes`,
  BY_DNI: (dni: string) => `${API_BASE_URL}/clientes/${dni}`,
};

// Rutas de RUC
export const RUC_ROUTES = {
  BASE: `${API_BASE_URL}/rucs`,
  BY_NUMBER: (numero: string) => `${API_BASE_URL}/rucs/${numero}`,
};

// Rutas de Métodos de Pago
export const PAYMENT_METHOD_ROUTES = {
  BASE: `${API_BASE_URL}/metodos-pago`,
  BY_ID: (id: number) => `${API_BASE_URL}/metodos-pago/${id}`,
};

// Rutas de Precios
export const PRICE_ROUTES = {
  BASE: `${API_BASE_URL}/precios`,
  BY_ID: (id: number) => `${API_BASE_URL}/precios/${id}`,
};