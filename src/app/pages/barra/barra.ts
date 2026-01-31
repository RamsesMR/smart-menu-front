import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { PedidoService } from '../../api/pedido-service';
import { PedidoStore } from '../../state/pedido.store';

/**
 * Estructura visual de un pedido para la interfaz de barra.
 */
type PedidoVM = {
  id: string;
  estadoPedido: string;
  nota: string;
  items: any[];
  total: number;
  fechaCreacion: string;
  mesa: string;
};

/**
 * Componente para la gestión de pedidos en cocina y barra.
 * Permite visualizar comandas agrupadas por mesa y cambiar sus estados.
 */
@Component({
  selector: 'app-barra',
  imports: [CommonModule],
  templateUrl: './barra.html',
  styleUrl: './barra.css',
})
export class Barra implements OnInit {
  /** Listado global de pedidos cargados. */
  pedidos: PedidoVM[] = [];
  /** Indica si hay una operación de carga en curso. */
  cargando = false;
  /** Almacena mensajes de error en la comunicación. */
  error = '';
  /** Filtro de estado seleccionado para la vista. */
  estadoSeleccionado: string = 'NUEVO';

  constructor(
    private pedidoService: PedidoService,
    private pedidoStore: PedidoStore,
  ) {}

  /**
   * Inicializa el componente cargando los pedidos.
   */
  ngOnInit() {
    this.cargarPedidos();
  }

  /**
   * Convierte identificadores complejos en cadenas de texto simples.
   * @param raw ID en formato string o formato objeto de base de datos.
   * @returns Cadena de texto con el ID normalizado.
   */
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

  /**
   * Obtiene los pedidos desde el servidor o el historial local si falla la conexión.
   */
  cargarPedidos() {
    this.cargando = true;
    this.error = '';

    this.pedidoService.obtenerPedidos().subscribe({
      next: (resp: any[]) => {
        // Lógica de carga desde backend
      },
      error: (err) => {
        console.warn('Backend no detectado. Cargando historial de rondas del cliente...');
        const historialComandas = this.pedidoStore.obtenerHistorial();
        const estadosModificados = JSON.parse(localStorage.getItem('mock_estados_pedidos') || '{}');

        if (historialComandas.length > 0) {
          this.pedidos = historialComandas.map((comanda: any) => ({
            id: comanda.id,
            estadoPedido: estadosModificados[comanda.id] || comanda.estadoPedido || 'NUEVO',
            nota: comanda.nota ?? '',
            items: comanda.items ?? [],
            total: Number(comanda.total ?? 0),
            fechaCreacion: comanda.fechaCreacion ?? '',
            mesa: comanda.mesa ?? '',
          }));
        } else {
          this.error = 'No hay pedidos confirmados aún.';
          this.pedidos = [];
        }
        this.cargando = false;
      },
    });
  }

  /**
   * Filtra pedidos por un estado específico.
   * @param estado Nombre del estado a filtrar.
   * @returns Listado de pedidos que coinciden con el estado.
   */
  getPedidosPorEstado(estado: string): PedidoVM[] {
    return this.pedidos.filter((p) => {
      const estadoPedido = p.estadoPedido ? p.estadoPedido.toUpperCase() : 'NUEVO';
      return estadoPedido === estado.toUpperCase();
    });
  }

  /**
   * Cambia el filtro de estado actual para la navegación.
   * @param estado Nuevo estado seleccionado.
   */
  cambiarEstadoFiltro(estado: string) {
    this.estadoSeleccionado = estado;
  }

  /**
   * Obtiene los pedidos filtrados según la selección actual.
   * @returns Lista de pedidos filtrados.
   */
  pedidosFiltrados(): PedidoVM[] {
    if (!this.estadoSeleccionado) return this.pedidos;
    return this.pedidos.filter((p) => p.estadoPedido === this.estadoSeleccionado);
  }

  /**
   * Traduce el estado técnico a un nombre legible.
   * @param estado Estado técnico del pedido.
   * @returns Nombre amigable del estado.
   */
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

  /** Valida si un pedido nuevo puede empezar a prepararse. */
  puedePasarAEnPreparacion(p: PedidoVM) {
    return p.estadoPedido === 'NUEVO';
  }

  /** Valida si un pedido en cocina puede marcarse como listo. */
  puedePasarAListo(p: PedidoVM) {
    return p.estadoPedido === 'EN_PREPARACION';
  }

  /** Valida si un pedido listo puede marcarse como entregado. */
  puedePasarAEntregado(p: PedidoVM) {
    return p.estadoPedido === 'LISTO';
  }

  /** Valida si un pedido puede ser cancelado. */
  puedeCancelar(p: PedidoVM) {
    return p.estadoPedido === 'NUEVO' || p.estadoPedido === 'EN_PREPARACION';
  }

  mensajeAccion = '';

  /**
   * Actualiza el estado de un pedido y lo persiste localmente.
   * @param p Pedido a modificar.
   * @param nuevoEstado Nuevo estado asignado.
   */
  actualizarEstado(p: PedidoVM, nuevoEstado: string) {
    this.mensajeAccion = '';
    p.estadoPedido = nuevoEstado;
    const estadosLocales = JSON.parse(localStorage.getItem('mock_estados_pedidos') || '{}');
    estadosLocales[p.id] = nuevoEstado;
    localStorage.setItem('mock_estados_pedidos', JSON.stringify(estadosLocales));
    this.pedidoStore.guardarEstado(nuevoEstado);
    localStorage.setItem('ultimo_estado_pedido', nuevoEstado);
  }

  /**
   * Obtiene identificadores de mesa únicos para un estado dado.
   * @param estado Estado por el que filtrar las mesas.
   * @returns Array de strings con los números de mesa.
   */
  getMesasEnEstado(estado: string): string[] {
    const pedidos = this.pedidos.filter((p) => p.estadoPedido === estado);
    const mesas = pedidos.map((p) => p.mesa);
    return [...new Set(mesas)].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }

  /**
   * Obtiene las rondas de una mesa específica en un estado concreto.
   * @param mesa Identificador de la mesa.
   * @param estado Estado de los pedidos a buscar.
   * @returns Lista de pedidos que cumplen ambos criterios.
   */
  getPedidosDeMesaEnEstado(mesa: string, estado: string): PedidoVM[] {
    return this.pedidos.filter((p) => p.mesa === mesa && p.estadoPedido === estado);
  }

  /**
   * Cambia el estado de todos los pedidos de una mesa simultáneamente.
   * @param mesa Identificador de la mesa.
   * @param nuevoEstado Nuevo estado para todos los pedidos de dicha mesa.
   */
  actualizarEstadoMesaCompleta(mesa: string, nuevoEstado: string) {
    const pedidosMesa = this.getPedidosDeMesaEnEstado(mesa, nuevoEstado);
    pedidosMesa.forEach((p) => this.actualizarEstado(p, nuevoEstado));
  }
}
