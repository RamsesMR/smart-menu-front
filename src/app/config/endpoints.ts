/**
 * Diccionario centralizado de rutas de la API
 */
export const endpoints = {
  /** Gestión de sesiones y perfiles */
  auth: {
    login: '/auth/login',
    me: '/auth/me',
  },
  /** Catálogo de productos (Carta) */
  productos: {
    list: '/producto',
    one: (id: string) => `/producto/${id}`,
  },
  /** Flujo del Cliente y Gestión de Barra */
  orders: {
    create: '/pedido', // Cambiado a singular para coincidir con el controlador
    list: '/pedido',
    status: (id: string) => `/pedido/${id}/estado`,
  },

  // Borra o ignora el bloque "pedidos" duplicado para evitar errores
  service: {
    call: '/servicio/llamar',
  },
};
