export const endpoints = {
  auth: {
    login: '/auth/login',
    me: '/auth/me',
  },    productos: {
    list: '/producto',   // este es tu "menú"
    one: (id: string) => `/producto/${id}`,
  },
  orders: {
    create: '/pedidos',
    myOrders: '/pedidos/mios',
  },
  service: {
    call: '/servicio/llamar',
  },

    pedidos: {
    list: '/pedido',                       // GET -> listar todos los pedidos
    update: '/pedido',                     // PUT -> actualizar un pedido (cambiar estado, etc.)
    one: (id: string) => `/pedido/${id}`,   // GET -> detalle de un pedido (si lo necesitas)
    // create no hace falta aquí para Barra, porque lo estás usando desde la parte de "Pedir"
  },




};
