import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PedidoService } from '../../api/pedido-service';
import { PedidoStore } from '../../state/pedido.store';

/**
 * Estructura visual de un pedido para la interfaz de barra.
 */
type PedidoVM = {
  id: string;
  estado: string;
  nota: string;
  lineasPedido: any[];
  totalPedido: number;
  fechaCreacion: string;
  mesaId: string;
};

@Component({
  selector: 'app-barra',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './barra.html',
  styleUrl: './barra.css',
})
export class Barra implements OnInit {
  pedidos: PedidoVM[] = [];
  cargando = false;
  error = '';
  estadoSeleccionado: string = 'RECIBIDO';
  mensajeAccion = '';

  constructor(
    private pedidoService: PedidoService,
    private pedidoStore: PedidoStore,
  ) { }

  ngOnInit() {
    console.log('barra iniciando');
    this.cargarPedidos();
  }

  /**
   * Normaliza los IDs de MongoDB (_id o id) a string.
   */
  private normalizarId(raw: any): string {
    if (!raw) return '';

    // 1) ya viene string
    if (typeof raw === 'string') return raw.trim();

    // 2) { $oid: "..." }
    if (raw.$oid) return String(raw.$oid).trim();

    // 3) algunos serializadores: { id: "..." } o { _id: "..." }
    if (raw.id) return String(raw.id).trim();
    if (raw._id) return String(raw._id).trim();

    // 4) Mongo "extended json": { "$numberLong": "..."} etc (raro)
    if (raw.value) return String(raw.value).trim();

    // 5) ObjectId "raw" (timestamp/date) -> NO podemos reconstruir hex fiable
    // devolvemos vacío
    return '';
  }

  /**
   * Carga real desde el Backend.
   */
  cargarPedidos() {
    this.cargando = true;
    this.error = '';

    this.pedidoService.obtenerPedidos().subscribe({
      next: (resp: any[]) => {

        this.pedidos = resp.map((p: any) => {
          console.log('[BARRA] Pedido raw', p);
          console.log('[BARRA] p.id =', p.id, 'p._id =', p._id);
          // Intentamos capturar el ID de todas las formas posibles antes de mapear
          const idFinal = this.normalizarId(p.id) || this.normalizarId(p._id);

          return {
            id: idFinal,
            estado: (p.estado || 'RECIBIDO').toUpperCase(),
            nota: p.nota ?? '',
            lineasPedido: p.lineasPedido ?? [],
            totalPedido: Number(p.totalPedido ?? 0),
            fechaCreacion: p.fechaCreacion ?? '',
            mesaId: p.mesaId ?? 'S/M',
          };
        });
        this.cargando = false;
      },
    });
  }

  /**
   * Actualiza el estado en el Backend y refresca la vista.
   */
  actualizarEstado(p: PedidoVM, nuevoEstado: string) {
    console.log('[BARRA] click actualizarEstado', {
      id: p.id,
      estadoActual: p.estado,
      nuevoEstado,
    });

    // 1) Protección: si el id es temporal o vacío, NO llames al backend
    // ObjectId válido de Mongo => 24 chars hex
    const esObjectId = /^[a-fA-F0-9]{24}$/.test((p.id || '').trim());

    if (!esObjectId) {
      console.error('[BARRA] ID inválido para backend (no es ObjectId)', p.id, p);
      this.mensajeAccion =
        '❌ Este pedido no tiene un ID válido (Mongo ObjectId). Revisa la serialización del backend (id debe venir como string).';
      return;
    }

    this.mensajeAccion = `Actualizando pedido ${p.id}...`;

    this.pedidoService.actualizarEstadoPedido(p.id, nuevoEstado).subscribe({
      next: (r) => {
        console.log('[BARRA] OK actualizarEstadoPedido', r);

        // 2) Actualizamos UI
        p.estado = nuevoEstado;

        this.mensajeAccion = `Pedido de la ${p.mesaId} marcado como ${this.textoEstadoBonito(nuevoEstado)}`;
        localStorage.setItem('ultimo_estado_pedido', nuevoEstado);
        setTimeout(() => (this.mensajeAccion = ''), 3000);

        // 3) OPCIONAL: recargar para asegurar consistencia (si quieres)
        // this.cargarPedidos();
      },
      error: (err) => {
        console.error('[BARRA] ERROR actualizarEstadoPedido', err);

        const msg =
          typeof err?.error === 'string'
            ? err.error
            : err?.error?.message || err?.message || 'Error desconocido';

        this.mensajeAccion = `❌ No se pudo actualizar el estado: ${msg}`;
      },
    });
  }

  /**
   * Lógica de filtrado y visualización
   */
  pedidosFiltrados() {
    return this.pedidos.filter(p => p.estado === this.estadoSeleccionado);
  }

  getMesasEnEstado(estado: string) {
    return [...new Set(this.pedidos.filter(p => p.estado === estado).map(p => p.mesaId))];
  }

  getPedidosDeMesaEnEstado(mesa: string, estado: string): PedidoVM[] {
    return this.pedidos.filter((p) => p.mesaId === mesa && p.estado === estado);
  }

  actualizarEstadoMesaCompleta(mesa: string, nuevoEstado: string) {
    // Buscamos los pedidos de esa mesa que NO están en el nuevo estado todavía
    const pedidosMesa = this.pedidos.filter(
      (p) => p.mesaId === mesa && p.estado !== nuevoEstado,
    );
    pedidosMesa.forEach((p) => this.actualizarEstado(p, nuevoEstado));
  }

  cambiarEstadoFiltro(estado: string) {
    this.estadoSeleccionado = estado;
  }

  textoEstadoBonito(estado: string): string {
    const mapa: Record<string, string> = {
      RECIBIDO: 'Recibido',
      PREPARANDO: 'En preparación',
      LISTO: 'Listo para servir',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado',
    };
    return mapa[estado] || estado;
  }

  puedePasarAEnPreparacion(p: PedidoVM) {
    return p.estado === 'RECIBIDO';
  }
  puedePasarAListo(p: PedidoVM) {
    return p.estado === 'PREPARANDO';
  }
  puedePasarAEntregado(p: PedidoVM) {
    return p.estado === 'LISTO';
  }
  puedeCancelar(p: PedidoVM) {
    return ['RECIBIDO', 'PREPARANDO'].includes(p.estado);
  }
}
