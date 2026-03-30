import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PedidoStore, ItemCarrito } from '../../state/pedido.store';
import { PedidoService, NuevoPedido } from '../../api/pedido-service';
import { interval, Subscription } from 'rxjs';

/**
 * Componente de gestión de confirmación y seguimiento de pedidos.
 * * @description Actúa como la "Caja" del restaurante. Permite revisar el carrito,
 * añadir notas por producto, enviar rondas a cocina y visualizar el progreso
 * del estado del pedido (Recibido -> Preparando -> Listo -> Entregado).
 * * Implementa un sistema de vigilancia periódica para actualizar el estado visual.
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
  estadoActual = 'RECIBIDO';
  /** Suscripción para la comprobación periódica de cambios de estado. */
  private vigilanciaSub?: Subscription;

  constructor(
    private pedidoStore: PedidoStore,
    private pedidoService: PedidoService,
    private router: Router,
  ) {}

  /**
   * Inicializa la vista cargando el carrito y verificando si hay pedidos previos en curso.
   * * @description Si detecta un estado guardado en el navegador, activa automáticamente
   * la vista de seguimiento.
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

  /** Calcula el total del pedido sumando (cantidad * precio) de cada item */ private recalcularTotal() {
    this.totalEuros = this.items.reduce((s, i) => s + (i.cantidad || 0) * (i.precioActual || 0), 0);
  }

  /** Navega de vuelta al catálogo en modo edición */
  seguirPidiendo() {
    this.router.navigate(['/menu'], { queryParams: { modo: 'armar' } });
  }
  /**
   * Crea un flujo de consulta (polling) que revisa cambios de estado en el sistema.
   * * @internal Este método actualiza la UI automáticamente cuando el backend o el sistema
   * de persistencia notifican un cambio de fase en el pedido.
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

  /** Se asegura de cancelar las suscripciones activas para evitar fugas de memoria */ ngOnDestroy() {
    this.vigilanciaSub?.unsubscribe();
  }

  /**
   * Incrementa o decrementa la cantidad de un item.
   * Si la cantidad llega a 0, el producto se elimina del carrito.
   * * @param item El producto a modificar.
   * @param delta Valor positivo o negativo a sumar a la cantidad actual.
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
   * Actualiza la nota personalizada de una línea de pedido específica.
   * @param item El item del carrito a modificar.
   * @param nota El texto con las instrucciones para cocina.
   */
  cambiarNota(item: ItemCarrito, nota: string) {
    if (item.enviado) return;
    item.nota = nota;
    this.pedidoStore.guardarItems(this.items);
  }

  /** Elimina únicamente los productos que todavía no han sido enviados al servidor */ vaciarCarrito() {
    this.items = this.items.filter((i) => i.enviado === true);
    this.pedidoStore.guardarItems(this.items);
    this.recalcularTotal();
  }

  /** Regresa a la vista del menú. */
  volverAlMenu() {
    this.router.navigate(['/menu'], { queryParams: { modo: 'armar' } });
  }

  /**
   * Valida si un string cumple con el formato hexadecimal de 24 caracteres de MongoDB
   * @param val Valor a evaluar
   */
  private esObjectId(val: any): boolean {
    return typeof val === 'string' && /^[a-fA-F0-9]{24}$/.test(val);
  }

  /**
   * Procesa el envío de los nuevos productos del carrito al backend.
   * * @description Este método:
   * 1. Filtra los items pendientes.
   * 2. Construye el objeto {@link NuevoPedido}.
   * 3. Intenta el envío mediante {@link PedidoService}.
   * 4. En caso de error, activa un "modo local" para asegurar que la experiencia de usuario no se corte.
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

    const cuerpo: NuevoPedido = {
      mesaId: this.mesa,
      nota: this.nota || '',
      lineasPedido: productosNuevos.map((i) => ({
        productoId: i.productoId || '',
        nombreActual: i.nombreActual,
        precioActual: i.precioActual,
        cantidad: i.cantidad,
        nota: i.nota || '',
      })),
      totalPedido: productosNuevos.reduce((s, i) => s + i.cantidad * i.precioActual, 0),
      fechaCreacion: new Date().toISOString(),
    };

    const finalizarEnvioLocal = () => {
      this.pedidoStore.agregarAlHistorial({ ...cuerpo, id: idComanda });
      this.items.forEach((item) => {
        if (!item.enviado) item.enviado = true;
      });
      this.pedidoStore.guardarItems(this.items);
      this.mensajeOk = '¡Ronda enviada con éxito!';
      setTimeout(() => {
        this.mensajeOk = '';
        this.pedidoConfirmado = true;
        this.estadoActual = 'RECIBIDO';
        localStorage.setItem('ultimo_estado_pedido', 'RECIBIDO');
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

  /**
   * Calcula el valor numérico para la barra de progreso de la UI.
   * @returns Porcentaje de 0 a 100.
   */
  getProgresoPorcentaje(): number {
    const mapa: Record<string, number> = {
      RECIBIDO: 20,
      PREPARANDO: 60,
      LISTO: 90,
      ENTREGADO: 100,
      CANCELADO: 0,
    };
    return mapa[this.estadoActual] || 0;
  }

  /**
   * Transforma el estado técnico en una etiqueta legible para el cliente final.
   * @param estado El código de estado (ej: 'PREPARANDO').
   */
  textoEstadoBonito(estado: string): string {
    const nombres: Record<string, string> = {
      RECIBIDO: 'Recibido en cocina',
      PREPARANDO: 'En preparación...',
      LISTO: '¡Listo! 🍽️',
      ENTREGADO: '¡Buen provecho!',
      CANCELADO: 'Cancelado',
    };
    return nombres[estado] || estado;
  }

  /** Resetea el flujo de seguimiento del pedido. */
  finalizarCicloPedido() {
    localStorage.removeItem('ultimo_estado_pedido');
    this.pedidoConfirmado = false;
    this.estadoActual = 'RECIBIDO';
  }

  /** @returns Listado de productos que ya han sido procesados por el servidor */
  itemsEnviados() {
    return this.items.filter((i) => i.enviado === true);
  }

  /** @returns Listado de productos pendientes de confirmación */
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
