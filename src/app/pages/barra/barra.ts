import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PedidoService } from '../../api/pedido-service';
import { PedidoStore } from '../../state/pedido.store';
import { interval, Subscription } from 'rxjs';

/**
 * Estructura visual de un pedido para la interfaz de barra.
 */
type PedidoVM = {
  id: string;
  estado: string;
  codigo: string;
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
  private pollSub?: Subscription;

  constructor(
    private pedidoService: PedidoService,
    private pedidoStore: PedidoStore,
  ) {}

  ngOnInit() {
    console.log('barra iniciando');
    this.cargarPedidos();
    this.pollSub = interval(5000).subscribe(() => {
      this.cargarPedidos();
    });
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
  }

  /**
   * Normaliza los IDs de MongoDB (_id o id) a string.
   */
  private normalizarId(raw: any): string {
    if (!raw) return '';

    // si ya viene string, intentamos extraer 24 hex
    if (typeof raw === 'string') {
      const s = raw.trim();
      const m = s.match(/[a-fA-F0-9]{24}/);
      return m ? m[0] : s;
    }

    // formato típico Mongo Extended JSON
    if (raw.$oid) return String(raw.$oid).trim();

    // otros formatos comunes
    if (raw.hexString) return String(raw.hexString).trim();
    if (raw.id) return this.normalizarId(raw.id);
    if (raw._id) return this.normalizarId(raw._id);

    // último intento: convertir a string y sacar 24 hex
    const s = String(raw);
    const m = s.match(/[a-fA-F0-9]{24}/);
    return m ? m[0] : '';
  }

  /**
   * Carga real desde el Backend.
   */
  cargarPedidos() {
    this.cargando = true;
    this.error = '';

    this.pedidoService.obtenerPedidos().subscribe({
      next: (resp: any[]) => {
        console.log('[BARRA] resp[0] RAW', resp?.[0]);
        console.log('[BARRA] resp RAW', resp);

        this.pedidos = (resp ?? []).map((p: any) => ({
          id: this.normalizarId(p.id ?? p._id ?? p?._Id),
          estado: p.estado && p.estado !== 'null' ? p.estado : 'RECIBIDO',
          codigo: p.codigo ?? '',
          nota: p.nota ?? '',
          lineasPedido: p.lineasPedido ?? [],
          totalPedido: Number(p.totalPedido ?? 0),
          fechaCreacion: p.fechaCreacion ?? '',
          mesaId: p.mesaId ?? '',
        }));

        console.log('[BARRA] vm[0]', this.pedidos?.[0]);

        this.cargando = false;
      },
      error: (e) => {
        console.error('[BARRA] error obtenerPedidos', e);
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
    return this.pedidos.filter((p) => p.estado === this.estadoSeleccionado);
  }

  getMesasEnEstado(estado: string) {
    return [...new Set(this.pedidos.filter((p) => p.estado === estado).map((p) => p.mesaId))];
  }

  getPedidosDeMesaEnEstado(mesa: string, estado: string): PedidoVM[] {
    return this.pedidos.filter((p) => p.mesaId === mesa && p.estado === estado);
  }

  actualizarEstadoMesaCompleta(mesa: string, nuevoEstado: string) {
    // Buscamos los pedidos de esa mesa que NO están en el nuevo estado todavía
    const pedidosMesa = this.pedidos.filter((p) => p.mesaId === mesa && p.estado !== nuevoEstado);
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
