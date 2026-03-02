import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MenuService } from '../../api/menu-service';
import { AuthService } from '../../api/auth-service';
import { PedidoStore, ItemCarrito } from '../../state/pedido.store';

/**
 * Estructura de datos para la representación visual de productos en el menú.
 */
type ProductoVM = {
  id: any;
  nombre: string;
  descripcion: string;
  precioConIva: number;
  imagen?: string;
  categoria?: string;
  qty: number;
  kcal?: number;
};

/**
 * Componente que gestiona el catálogo de productos.
 * Permite la visualización de la carta y la selección de productos para el pedido.
 */
@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './menu.html',
  styleUrls: ['./menu.css'],
})
export class Menu implements OnInit {
  /** Determina si el usuario solo visualiza o está armando un pedido. */
  modo: 'ver' | 'armar' = 'ver';
  /** Término de búsqueda para filtrar productos. */
  search = '';
  /** Listado de categorías disponibles. */
  categorias: string[] = ['Entrantes', 'Principales', 'Postres', 'Bebidas'];
  /** Categoría seleccionada actualmente. */
  catActiva: string | null = null;
  /** Listado de productos procesados para la vista. */
  productos: ProductoVM[] = [];
  /** Identificador de la mesa actual. */
  mesaId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private menuService: MenuService,
    private auth: AuthService,
    private pedidoStore: PedidoStore,
  ) {}

  /** Obtiene la suma total de unidades seleccionadas. */
  get totalItems() {
    return this.productos.reduce((acc, p) => acc + (p.qty || 0), 0);
  }

  /** Obtiene el importe total del pedido actual. */
  get totalEuros() {
    return this.productos.reduce((acc, p) => acc + (p.qty || 0) * (Number(p.precioConIva) || 0), 0);
  }

  /**
   * Inicializa el componente gestionando parámetros de ruta y cargando el catálogo.
   */
  ngOnInit() {
    this.route.queryParamMap.subscribe((q) => {
      const m = q.get('modo') || 'armar';
      this.modo = m === 'armar' ? 'armar' : 'ver';
      this.mesaId = q.get('mesa');
      if (this.mesaId) {
        this.pedidoStore.guardarMesa(this.mesaId);
      }
    });

    this.menuService.getMenu().subscribe({
      next: (resp: any) => {
        const arr = resp.productos || (Array.isArray(resp) ? resp : []);
        const guardados = this.pedidoStore.obtenerItems().filter((i) => !i.enviado);

        this.productos = (arr || []).map((p: any) => {
          const idActual = p?.id ?? p?._id ?? p?._Id;
          const itemEnCarrito = guardados.find((i) => i.productoId === String(idActual));

          return {
            id: idActual,
            nombre: p?.nombre ?? '',
            descripcion: p?.descripcion ?? '',
            precioConIva: Number(p?.precioConIva ?? 0),
            imagen: p?.imagen,
            categoria: p?.categoria,
            kcal: p?.kcal ?? 0,
            qty: itemEnCarrito ? itemEnCarrito.cantidad : 0,
          };
        });
      },
      error: (e) => console.error('Error al cargar menú:', e),
    });
  }

  /**
   * Actualiza la categoría activa para el filtrado.
   * @param c Nombre de la categoría o null para mostrar todas.
   */
  setCat(c: string | null) {
    this.catActiva = c;
  }

  /**
   * Filtra los productos según la categoría seleccionada y el texto de búsqueda.
   * @returns Lista de productos filtrados.
   */
  productosFiltrados(): ProductoVM[] {
    const s = this.search.trim().toLowerCase();
    return this.productos.filter((p) => {
      const okCat = !this.catActiva || p.categoria?.toLowerCase() === this.catActiva.toLowerCase();
      const okSearch = !s || (p.nombre + ' ' + p.descripcion).toLowerCase().includes(s);
      return okCat && okSearch;
    });
  }

  /** Optimiza el renderizado de la lista en el DOM. */
  trackByIndex(i: number) {
    return i;
  }

  /**
   * Incrementa la cantidad de un producto si el modo edición está activo.
   * @param p Producto a incrementar.
   */
  inc(p: ProductoVM) {
    if (this.modo !== 'armar') return;
    p.qty = (p.qty || 0) + 1;
  }

  /**
   * Decrementa la cantidad de un producto sin bajar de cero.
   * @param p Producto a decrementar.
   */
  dec(p: ProductoVM) {
    if (this.modo !== 'armar') return;
    p.qty = Math.max(0, (p.qty || 0) - 1);
  }

  /**
   * Obtiene la cantidad actual de un producto.
   * @param p Producto a consultar.
   * @returns Unidades seleccionadas.
   */
  getQty(p: ProductoVM) {
    return p.qty || 0;
  }

  /**
   * Gestiona la apertura de detalles de producto en modo lectura.
   * @param p Producto seleccionado.
   */
  openProducto(p: ProductoVM) {
    if (this.modo === 'armar') return;
  }

  /**
   * Sincroniza la selección actual con el almacenamiento y navega a la pantalla de pedido.
   */
  irAPedir() {
    const itemsEnTienda = this.pedidoStore.obtenerItems();
    const itemsEnviados = itemsEnTienda.filter((i) => i.enviado);

    const itemsNuevos: ItemCarrito[] = this.productos
      .filter((p) => (p.qty || 0) > 0)
      .map((p) => ({
        productoId: String(p.id),
        nombreActual: p.nombre,
        precioActual: Number(p.precioConIva || 0),
        cantidad: p.qty || 0,
        nota: '',
        enviado: false,
      }));

    const carritoFinal = [...itemsEnviados, ...itemsNuevos];
    this.pedidoStore.guardarItems(carritoFinal);
    this.router.navigate(['/pedir']);
  }

  /**
   * Cierra la sesión del usuario y redirige al acceso.
   */
  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
