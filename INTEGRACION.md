# Guía de Integración Frontend-Backend: SmartMenu

Esta guía describe cómo conectar el frontend de **SmartMenu** con un backend real y una base de datos.

---

## 1. Requisitos de Infraestructura

- **Servidor API:** RESTful API (Node.js, Python, Java, etc.).
- **Protocolo:** HTTPS para producción.
- **CORS:** El backend debe permitir peticiones desde el dominio del frontend.

## 2. Configuración de Entornos

Define la URL base de tu API en los archivos de configuración de Angular para evitar cambios manuales en cada servicio.

typescript
// src/environments/environment.ts
export const environment = {
production: false,
apiUrl: 'http://localhost:3000/api'
};

## 3. Arquitectura de Comunicación

El flujo de datos sigue un patrón de Servicio -> Store -> Componente.

Flujo de Envío de Pedido:
El usuario añade items al PedidoStore (Local).

El componente Pedir llama al PedidoService.

El servicio realiza una petición POST al backend con el objeto NuevoPedido.

## 4. Modelos de Datos Requeridos

Para que el frontend procese la información correctamente, el backend debe respetar las siguientes estructuras JSON:

Producto (GET /productos)
JSON
{
"id": "string",
"nombre": "string",
"descripcion": "string",
"precioConIva": 12.50,
"categoria": "Entrantes",
"imagen": "url_string",
"kcal": 350
}
Pedido (POST /pedidos)
JSON
{
"id": "cmd-123456",
"mesa": "Mesa 1",
"items": [
{
"productoId": "abc",
"cantidad": 2,
"nota": "Sin cebolla"
}
],
"total": 25.00,
"estadoPedido": "NUEVO"
}

## 5. Seguridad y Autenticación (JWT)

El frontend incluye un AuthInterceptor. Para activarlo, el backend debe:

Devolver un JWT en el login.

El frontend lo almacena: localStorage.setItem('token', token).

El interceptor lo añadirá automáticamente en el header de cada petición: Authorization: Bearer <tu_token>

## 6. Sincronización de la Barra (Cocina)

La vista de administración (/barra) requiere actualizaciones frecuentes.

Opción A: Polling (Simple)
Implementar un interval en barra.ts que llame a getPedidos() cada 10 segundos.

Opción B: WebSockets (Recomendado)
Para una experiencia en tiempo real, se debe integrar socket.io-client en el servicio de pedidos para escuchar el evento nuevo-pedido.

## 7. Personalización de Marca

Todo el diseño se controla mediante CSS Variables. Para cambiar colores o estilos globales, editar variables.css:

        CSS
        :root {
        --accent-color: #2d6cdf; /* Color principal de acción */
        --bg-dark: #0b0f14;      /* Fondo de la interfaz */
        --radius-md: 12px;       /* Redondeo de componentes */
        }

## 8. Estados del Pedido

El sistema de filtros y el Kanban de cocina dependen de estos valores exactos en la base de datos:

NUEVO: Pedido recibido.

EN_PREPARACION: En cocina.

LISTO: Pendiente de servir.

ENTREGADO: Ciclo finalizado.
