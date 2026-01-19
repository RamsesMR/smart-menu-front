import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { PedidoService } from '../../api/pedido-service';

type PedidoVM = {
  id: string;
  estadoPedido: string;
  nota: string;
  items: any[];
  total: number;
  fechaCreacion: string;
  mesa: string;
};

@Component({
  selector: 'app-barra',
  imports: [CommonModule],
  templateUrl: './barra.html',
  styleUrl: './barra.css',
})
export class Barra implements OnInit {
  pedidos: PedidoVM[] = [];

  cargando = false;
  error = '';

  estadoSeleccionado: string = 'NUEVO';

  constructor(private pedidoService: PedidoService) {}

  ngOnInit() {
    this.cargarPedidos();
  }
  private normalizarId(raw: any): string {
    if (!raw) return '';
    if (typeof raw === 'string') return raw;

    if (raw.$oid) return String(raw.$oid);

    if (raw.hexString) return String(raw.hexString);

    try {
      return JSON.stringify(raw);
    } catch {
      return String(raw);
    }
  }
  cargarPedidos() {
    this.cargando = true;
    this.error = '';

    this.pedidoService.obtenerPedidos().subscribe({
      next: (resp: any[]) => {
        const arr = Array.isArray(resp) ? resp : ((resp as any)?.data ?? []);
        this.pedidos = arr.map((p: any) => ({
          id: this.normalizarId(p.id ?? p._id ?? p?._Id),

          estadoPedido: p.estadoPedido ?? '',
          nota: p.nota ?? '',
          items: p.items ?? [],
          total: Number(p.total ?? 0),
          fechaCreacion: p.fechaCreacion ?? '',
          mesa: p.mesa ?? '',
        }));
        this.cargando = false;
      },
      error: (err) => {
        console.error('ERROR al obtener pedidos', err);
        this.error = 'No se pudieron cargar los pedidos.';
        this.cargando = false;
      },
    });
  }

  // para las pestañas de estado (NUEVO, EN_PREPARACION, LISTO, ENTREGADO, CANCELADO)
  cambiarEstadoFiltro(estado: string) {
    this.estadoSeleccionado = estado;
  }

  pedidosFiltrados(): PedidoVM[] {
    if (!this.estadoSeleccionado) return this.pedidos;
    return this.pedidos.filter((p) => p.estadoPedido === this.estadoSeleccionado);
  }

  // ---- acciones sobre un pedido ----

  textoEstadoBonito(estado: string) {
    switch (estado) {
      case 'NUEVO':
        return 'Nuevo';
      case 'EN_PREPARACION':
        return 'En preparación';
      case 'LISTO':
        return 'Listo';
      case 'ENTREGADO':
        return 'Entregado';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return estado;
    }
  }

  puedePasarAEnPreparacion(p: PedidoVM) {
    return p.estadoPedido === 'NUEVO';
  }

  puedePasarAListo(p: PedidoVM) {
    return p.estadoPedido === 'EN_PREPARACION';
  }

  puedePasarAEntregado(p: PedidoVM) {
    return p.estadoPedido === 'LISTO';
  }

  puedeCancelar(p: PedidoVM) {
    return p.estadoPedido === 'NUEVO' || p.estadoPedido === 'EN_PREPARACION';
  }

  mensajeAccion = '';

  actualizarEstado(p: PedidoVM, nuevoEstado: string) {
    this.mensajeAccion = '';

    // Construimos un payload mínimo sin items
    const cuerpo = {
      id: p.id, // debe ser el ObjectId en string (24 chars)
      estadoPedido: nuevoEstado,
      nota: p.nota,
      total: p.total,
      fechaCreacion: p.fechaCreacion,
      mesa: p.mesa,
      // ❌ NO MANDAMOS items para evitar el problema con productoId
    };

    console.log('PUT /pedido/ con cuerpo:', cuerpo);

    this.pedidoService.actualizarPedido(cuerpo as any).subscribe({
      next: (res) => {
        console.log('PEDIDO ACTUALIZADO OK:', res);
        // actualizamos en memoria para que la UI cambie
        p.estadoPedido = nuevoEstado;
      },
      error: (err) => {
        console.error('ERROR al actualizar pedido', err);
        console.error('DETALLE BACKEND:', err.error);
        this.mensajeAccion = 'No se pudo actualizar el pedido. Revisa la consola.';
      },
    });
  }
}
