import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PedidoStore, ItemCarrito } from '../../state/pedido.store';
import { PedidoService, NuevoPedido } from '../../api/pedido-service';
import { interval, Subscription } from 'rxjs';

/**
 * Componente que gestiona la revisión del carrito y el proceso de envío a cocina.
 * Maneja el ciclo de vida del pedido, desde la edición de cantidades hasta el seguimiento del estado.
 */
@Component({
  selector: 'app-pedir',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedir.html',
  styleUrls: ['./pedir.css'],
})
export class Pedir implements OnInit, OnDestroy {
  /** Lista de productos seleccionados. */
  items: ItemCarrito[] = [];
  /** Importe total de la compra. */
  totalEuros = 0;
  /** Comentario general para el personal de cocina. */
  nota = '';
  /** Número o identificador de la mesa. */
  mesa = '';
  /** Indica si hay un proceso de envío en curso. */
  enviando = false;
  /** Mensaje informativo de error. */
  mensajeError = '';
  /** Mensaje informativo de éxito. */
  mensajeOk = '';
  /** Controla si se debe mostrar la vista de seguimiento del pedido. */
  pedidoConfirmado = false;
  /** Estado actual de la comanda en el flujo de trabajo. */
  estadoActual = 'NUEVO';
  /** Suscripción para la comprobación periódica de cambios de estado. */
  private vigilanciaSub?: Subscription;

  constructor(
    private pedidoStore: PedidoStore,
    private pedidoService: PedidoService,
    private router: Router,
  ) {}

  /**
   * Carga los datos iniciales y recupera el estado de seguimiento si existe un pedido previo.
   */
  ngOnInit(): void {
    this.items = this.pedidoStore.obtenerItems();
    this.mesa = this.pedidoStore.obtenerMesa() || 'Mesa 1';
    this.recalcularTotal();

    const estadoGuardado = localStorage.getItem('ultimo_estado_pedido');

    if (estadoGuardado && this.tieneItemsEnviados()) {
      this.pedidoConfirmado = true;
      this.estadoActual = estadoGuardado;
      this.iniciarVigilanciaEstado();

      if (estadoGuardado === 'ENTREGADO') {
        setTimeout(() => {
          this.pedidoConfirmado = false;
        }, 10000);
      }
    } else {
      this.pedidoConfirmado = false;
    }
  }

  /** Actualiza el total económico basándose en los productos actuales. */
  private recalcularTotal() {
    this.totalEuros = this.items.reduce((s, i) => s + (i.cantidad || 0) * (i.precioActual || 0), 0);
  }

  /** Navega al menú para añadir más productos. */
  seguirPidiendo() {
    this.router.navigate(['/menu'], { queryParams: { modo: 'armar' } });
  }

  /**
   * Inicia un temporizador que consulta cambios de estado en el almacenamiento local.
   */
  iniciarVigilanciaEstado() {
    this.vigilanciaSub = interval(2000).subscribe(() => {
      const estadoEnStorage = localStorage.getItem('ultimo_estado_pedido');
      if (estadoEnStorage && estadoEnStorage !== this.estadoActual) {
        this.estadoActual = estadoEnStorage;

        if (this.estadoActual === 'ENTREGADO') {
          setTimeout(() => {
            this.pedidoConfirmado = false;
            localStorage.removeItem('ultimo_estado_pedido');
            this.vigilanciaSub?.unsubscribe();
          }, 10000);
        }
      }
    });
  }

  /** Limpia las suscripciones al destruir el componente. */
  ngOnDestroy() {
    this.vigilanciaSub?.unsubscribe();
  }

  /**
   * Modifica la cantidad de un producto. Si llega a cero, lo elimina.
   * @param item Producto a modificar.
   * @param delta Cantidad a sumar o restar.
   */
  cambiarCantidad(item: ItemCarrito, delta: number) {
    if (item.enviado) return;

    const nuevaCantidad = (item.cantidad || 0) + delta;
    if (nuevaCantidad <= 0) {
      this.items = this.items.filter((i) => i !== item);
    } else {
      item.cantidad = nuevaCantidad;
    }
    this.pedidoStore.guardarItems(this.items);
    this.recalcularTotal();
  }

  /**
   * Asocia una observación específica a un producto del carrito.
   * @param item Producto seleccionado.
   * @param nota Texto de la observación.
   */
  cambiarNota(item: ItemCarrito, nota: string) {
    if (item.enviado) return;
    item.nota = nota;
    this.pedidoStore.guardarItems(this.items);
  }

  /** Elimina todos los productos que aún no han sido enviados a cocina. */
  vaciarCarrito() {
    this.items = this.items.filter((i) => i.enviado === true);
    this.pedidoStore.guardarItems(this.items);
    this.recalcularTotal();
  }

  /** Regresa a la vista del catálogo. */
  volverAlMenu() {
    this.router.navigate(['/menu'], { queryParams: { modo: 'armar' } });
  }

  /**
   * Empaqueta los productos nuevos y los envía como una ronda independiente a cocina.
   */
  confirmarPedido() {
    this.mensajeError = '';
    this.mensajeOk = '';

    const productosNuevos = this.itemsNuevos();

    if (productosNuevos.length === 0) {
      this.mensajeError = 'No hay productos nuevos para enviar.';
      return;
    }

    this.enviando = true;

    const idComanda = 'cmd-' + Date.now();
    const cuerpo: NuevoPedido & { id: string } = {
      id: idComanda,
      estadoPedido: 'NUEVO',
      nota: this.nota || '',
      items: JSON.parse(JSON.stringify(productosNuevos)),
      total: productosNuevos.reduce((s, i) => s + i.cantidad * i.precioActual, 0),
      fechaCreacion: new Date().toISOString(),
      mesa: this.mesa,
    };

    const finalizarEnvioLocal = () => {
      this.pedidoStore.agregarAlHistorial(cuerpo);
      this.items.forEach((item) => {
        if (!item.enviado) item.enviado = true;
      });
      this.pedidoStore.guardarItems(this.items);

      this.mensajeOk = '🚀 ¡Ronda enviada con éxito!';

      setTimeout(() => {
        this.mensajeOk = '';
        this.pedidoConfirmado = true;
        this.estadoActual = 'NUEVO';
        localStorage.setItem('ultimo_estado_pedido', 'NUEVO');
        this.enviando = false;
        this.iniciarVigilanciaEstado();
      }, 2000);
    };

    this.pedidoService.crearPedido(cuerpo).subscribe({
      next: () => finalizarEnvioLocal(),
      error: () => {
        console.warn('Usando modo local por falta de conexión.');
        finalizarEnvioLocal();
      },
    });
  }

  /** Devuelve el porcentaje numérico de progreso según el estado actual. */
  getProgresoPorcentaje(): number {
    const mapa: Record<string, number> = {
      NUEVO: 20,
      EN_PREPARACION: 60,
      LISTO: 90,
      ENTREGADO: 100,
    };
    return mapa[this.estadoActual] || 0;
  }

  /** Traduce el estado técnico a un mensaje amigable para el cliente. */
  textoEstadoBonito(estado: string): string {
    const nombres: Record<string, string> = {
      NUEVO: 'Recibido en cocina',
      EN_PREPARACION: 'En preparación...',
      LISTO: '¡Listo! 🍽️',
      ENTREGADO: '¡Buen provecho!',
    };
    return nombres[estado] || estado;
  }

  /** Resetea el flujo de seguimiento del pedido. */
  finalizarCicloPedido() {
    localStorage.removeItem('ultimo_estado_pedido');
    this.pedidoConfirmado = false;
    this.estadoActual = 'NUEVO';
  }

  /** Filtra los productos que ya están confirmados por cocina. */
  itemsEnviados() {
    return this.items.filter((i) => i.enviado === true);
  }

  /** Filtra los productos pendientes de envío. */
  itemsNuevos() {
    return this.items.filter((i) => !i.enviado);
  }

  /** Comprueba si hay productos ya enviados en el historial. */
  tieneItemsEnviados() {
    return this.itemsEnviados().length > 0;
  }

  /** Comprueba si hay productos en el carrito esperando ser enviados. */
  tieneItemsNuevos() {
    return this.itemsNuevos().length > 0;
  }

  /** Función de ayuda para la optimización de listas en la vista. */
  identificadorItem(index: number, item: ItemCarrito) {
    return `${item.productoId}-${item.enviado}-${index}`;
  }
}
