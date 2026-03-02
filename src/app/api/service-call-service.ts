import { Injectable } from '@angular/core';
import { ApiClient } from './api-client';
import { endpoints } from '../config/endpoints';

/**
 * Servicio para la gestión de llamadas de servicio.
 * Permite a los clientes solicitar asistencia física
 * del personal de sala directamente desde su dispositivo/mesa.
 */
@Injectable({ providedIn: 'root' })
export class ServiceCallService {
  /**
   *
   * @param api Cliente de comunicación centralizado{@link ApiClient}.
   */
  constructor(private api: ApiClient) {}

  /**
   * Envía una notificación de aviso al personal de servicio.
   * El backend debería emitir un evento para alertar a los camareros
   * en tiempo real.
   * @param body Objeto que contiene el identificador de la mesa.
   * @returns Un Observable indicando el éxito o fallo de la petición.
   * @example
   * ```typescript
   * this.serviceCall.callWaiter({ mesaId: 'MESA-05' }).subscribe();
   * ```
   */
  callWaiter(body: { mesaId?: string }) {
    return this.api.post<{ ok: boolean }>(endpoints.service.call, body);
  }
}
