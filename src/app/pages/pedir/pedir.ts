import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PedidoStore, ItemCarrito } from '../../state/pedido.store';
import { PedidoService, NuevoPedido } from '../../api/pedido-service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-pedir',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedir.html',
  styleUrls: ['./pedir.css'],
})
export class Pedir implements OnInit, OnDestroy {
  items: ItemCarrito[] = [];
  totalEuros = 0;
  totalNuevaRonda = 0;
  nota = '';
  mesa = '';
  enviando = false;
  mensajeError = '';
  mensajeOk = '';
  pedidoConfirmado = false;
  estadoActual = 'RECIBIDO';
  private vigilanciaSub?: Subscription;

  constructor(
    private pedidoStore: PedidoStore,
    private pedidoService: PedidoService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.items = this.pedidoStore.obtenerItems();
    this.mesa = this.pedidoStore.obtenerMesa() || 'Mesa 1';
    this.recalcularTotales();

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

  private recalcularTotales(): void {
    this.totalEuros = this.items.reduce(
      (s, i) => s + (Number(i.cantidad || 0) * Number(i.precioActual || 0)),
      0,
    );

    this.totalNuevaRonda = this.items
      .filter((i) => !i.enviado)
      .reduce(
        (s, i) => s + (Number(i.cantidad || 0) * Number(i.precioActual || 0)),
        0,
      );
  }

  seguirPidiendo(): void {
    this.router.navigate(['/menu'], { queryParams: { modo: 'armar' } });
  }

  iniciarVigilanciaEstado(): void {
    this.vigilanciaSub?.unsubscribe();

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

  ngOnDestroy(): void {
    this.vigilanciaSub?.unsubscribe();
  }

  cambiarCantidad(item: ItemCarrito, delta: number): void {
    if (item.enviado) return;

    const index = this.items.findIndex(
      (i) =>
        i.productoId === item.productoId &&
        i.enviado === item.enviado &&
        i.nombreActual === item.nombreActual,
    );

    if (index === -1) return;

    const cantidadActual = Number(this.items[index].cantidad ?? 0);
    const nuevaCantidad = cantidadActual + delta;

    if (nuevaCantidad <= 0) {
      this.items.splice(index, 1);
    } else {
      this.items[index] = {
        ...this.items[index],
        cantidad: nuevaCantidad,
      };
    }

    this.items = [...this.items];
    this.pedidoStore.guardarItems(this.items);
    this.recalcularTotales();
  }

  cambiarNota(item: ItemCarrito, nota: string): void {
    if (item.enviado) return;

    const index = this.items.findIndex(
      (i) =>
        i.productoId === item.productoId &&
        i.enviado === item.enviado &&
        i.nombreActual === item.nombreActual,
    );

    if (index === -1) return;

    this.items[index] = {
      ...this.items[index],
      nota,
    };

    this.items = [...this.items];
    this.pedidoStore.guardarItems(this.items);
  }

  vaciarCarrito(): void {
    this.items = this.items.filter((i) => i.enviado === true);
    this.pedidoStore.guardarItems(this.items);
    this.recalcularTotales();
  }

  volverAlMenu(): void {
    this.router.navigate(['/menu'], { queryParams: { modo: 'armar' } });
  }

  confirmarPedido(): void {
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
      totalPedido: productosNuevos.reduce(
        (s, i) => s + (Number(i.cantidad) * Number(i.precioActual)),
        0,
      ),
      fechaCreacion: new Date().toISOString(),
    };

    const finalizarEnvioLocal = () => {
      this.pedidoStore.agregarAlHistorial({ ...cuerpo, id: idComanda });

      this.items = this.items.map((item) =>
        !item.enviado
          ? { ...item, enviado: true }
          : item
      );

      this.pedidoStore.guardarItems(this.items);
      this.recalcularTotales();

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

  finalizarCicloPedido(): void {
    localStorage.removeItem('ultimo_estado_pedido');
    this.pedidoConfirmado = false;
    this.estadoActual = 'RECIBIDO';
  }

  itemsEnviados(): ItemCarrito[] {
    return this.items.filter((i) => i.enviado === true);
  }

  itemsNuevos(): ItemCarrito[] {
    return this.items.filter((i) => !i.enviado);
  }

  tieneItemsEnviados(): boolean {
    return this.itemsEnviados().length > 0;
  }

  tieneItemsNuevos(): boolean {
    return this.itemsNuevos().length > 0;
  }

  identificadorItem(index: number, item: ItemCarrito): string {
    return `${item.productoId}-${item.enviado}-${index}`;
  }
}