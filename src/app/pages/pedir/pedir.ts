import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { PedidoStore,ItemCarrito } from '../../state/pedido.sotore';  // AJUSTA RUTA

import { PedidoService, NuevoPedido } from '../../api/pedido-service'; // AJUSTA RUTA


@Component({
  selector: 'app-pedir',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedir.html',
  styleUrls: ['./pedir.css'],
})
export class Pedir implements OnInit {

  items: ItemCarrito[] = [];
  totalEuros = 0;
  nota = '';
  mesa = '';                // si quieres pedir mesa (ej: "Mesa 1")
  enviando = false;
  mensajeError = '';
  mensajeOk = '';

  constructor(
    private pedidoStore: PedidoStore,
    private pedidoService: PedidoService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.items = this.pedidoStore.obtenerItems();
    this.recalcularTotal();
  }

  private recalcularTotal() {
    this.totalEuros = this.items.reduce(
      (s, i) => s + (i.cantidad || 0) * (i.precioActual || 0),
      0
    );
  }

  seguirPidiendo() {
  this.pedidoStore.vaciar();           // 🧹 vaciamos el carrito
  this.items = [];                     // limpiamos también en memoria
  this.router.navigate(['/menu'], {
    queryParams: { modo: 'armar' },    // volvemos al menú en modo armar
  });
}


  // Cambiar cantidad en una línea
  cambiarCantidad(item: ItemCarrito, delta: number) {
    const nuevaCantidad = (item.cantidad || 0) + delta;

    if (nuevaCantidad <= 0) {
      // Quitamos la línea del pedido
      this.items = this.items.filter(i => i !== item);
    } else {
      item.cantidad = nuevaCantidad;
    }

    this.pedidoStore.guardarItems(this.items);
    this.recalcularTotal();
  }

  // Guardar nota de cocina
  cambiarNota(item: ItemCarrito, nota: string) {
    item.nota = nota;
    this.pedidoStore.guardarItems(this.items);
  }

  // Vaciar por completo el pedido
  vaciarCarrito() {
    this.items = [];
    this.pedidoStore.vaciar();
    this.recalcularTotal();
  }

  // Volver a la pantalla del menú
  volverAlMenu() {
    this.router.navigate(['/menu'], { queryParams: { modo: 'armar' } });
  }

confirmarPedido() {
  if (!this.items.length) {
    console.error('No hay productos en el pedido');
    return;
  }

  const hoy = new Date().toISOString().slice(0, 10);

  const items: ItemCarrito[] = this.items.map(i => ({
    // ⬇️ si tienes un productoId válido de 24 chars, puedes dejarlo;
    // si no, simplemente no lo pongas y ya (es opcional)
    // productoId: i.productoId,

    nombreActual: i.nombreActual,
    precioActual: Number(i.precioActual || 0),
    cantidad: Number(i.cantidad || 0),
    nota: i.nota || '',
  }));

  const cuerpo: NuevoPedido = {
    estadoPedido: 'NUEVO',
    nota: this.nota || '',
    items,
    total: Number(this.totalEuros || 0),
    fechaCreacion: hoy,
    mesa: this.mesa || 'Mesa 1',
  };

  console.log('CUERPO QUE ENVÍO A /pedido:', cuerpo);

  this.pedidoService.crearPedido(cuerpo).subscribe({
    next: (res) => {
      console.log('PEDIDO INSERTADO OK:', res);
      this.pedidoStore.vaciar();
      this.router.navigate(['/inicio']);
    },
    error: (err) => {
      console.error('ERROR AL INSERTAR PEDIDO', err);
      console.error('BACKEND RESPONDE:', err.error);
    },
  });
}



}
