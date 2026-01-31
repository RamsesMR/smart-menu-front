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
  /** Flujo del Cliente (App Móvil/Tablet) */
  orders: {
    create: '/pedidos',
    myOrders: '/pedidos/mios',
  },
  /** Llamadas de servicio a mesa */
  service: {
    call: '/servicio/llamar',
  },
  /** Gestión de Barra y Cocina */
  pedidos: {
    list: '/pedido',
    update: '/pedido',
    one: (id: string) => `/pedido/${id}`,
  },
};
