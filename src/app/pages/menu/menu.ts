import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MenuService } from '../../api/menu-service';
import { AuthService } from '../../api/auth-service';
import { PedidoStore,ItemCarrito } from '../../state/pedido.sotore';

//AQUIIIII FUNCIONAAA

// import { OrderStore, CartItem } from '../../state/order.storage';

type ProductoVM = {
  id: any;
  nombre: string;
  descripcion: string;
  precioConIva: number;
  imagen?: string;
  categoria?: string;
  qty: number;
  
};

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './menu.html',
  styleUrls: ['./menu.css'],
})
export class Menu implements OnInit {
  modo: 'ver' | 'armar' = 'ver';
  search = '';
  categorias: string[] = ['Entrantes', 'Principales', 'Postres', 'Bebidas'];
  catActiva: string | null = null;
  cart: Record<string, number> = {};
  productos: ProductoVM[] = [];
  carrito: Record<string, number> = {};

  constructor(
  private route: ActivatedRoute,
  private router: Router,
  private menuService: MenuService,
  private auth: AuthService,
  private pedidoStore: PedidoStore
  ) {}

  // Totales calculados sobre qty por producto (NO hay claves compartidas)
  get totalItems() {
    return this.productos.reduce((acc, p) => acc + (p.qty || 0), 0);
  }

  get totalEuros() {
    return this.productos.reduce(
      (acc, p) => acc + (p.qty || 0) * (Number(p.precioConIva) || 0),
      0
    );
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(q => {
      const m = q.get('modo') || 'ver';
      this.modo = (m === 'armar') ? 'armar' : 'ver';
    });

    this.menuService.getMenu().subscribe({
      next: (resp: any) => {
        // tu backend parece devolver array directo; si viniera envuelto, lo ajustamos aquí
        const arr = Array.isArray(resp) ? resp : (resp?.data ?? resp?.content ?? resp?.items ?? []);

        this.productos = (arr || []).map((p: any) => ({
          id: p?.id ?? p?._id ?? p?._Id,        // lo guardamos como venga
          nombre: p?.nombre ?? '',
          descripcion: p?.descripcion ?? '',
          precioConIva: Number(p?.precioConIva ?? 0),
          imagen: p?.imagen,
          categoria: p?.categoria,
          qty: 0,                               // 👈 inicial
        }));

        console.log('productos.length:', this.productos.length);
      },
      error: (e) => console.error('ERROR MENU:', e),
    });
  }

  setCat(c: string | null) { this.catActiva = c; }

  productosFiltrados(): ProductoVM[] {
    const s = this.search.trim().toLowerCase();
    return this.productos.filter(p => {
      const okCat = !this.catActiva || p.categoria === this.catActiva;
      const okSearch = !s || (p.nombre + ' ' + p.descripcion).toLowerCase().includes(s);
      return okCat && okSearch;
    });
  }

  // trackBy: usa índice si el id viene raro y aun así quieres estabilidad visual
  // (si tu id ya viene bien, puedes devolver p.id)
  trackByIndex(i: number) { return i; }

  inc(p: ProductoVM) {
    if (this.modo !== 'armar') return;
    p.qty = (p.qty || 0) + 1;
  }

  dec(p: ProductoVM) {
    if (this.modo !== 'armar') return;
    p.qty = Math.max(0, (p.qty || 0) - 1);
  }

  getQty(p: ProductoVM) { return p.qty || 0; }

  openProducto(p: ProductoVM) {
    if (this.modo === 'armar') return;
    // futuro detalle
  }

 irAPedir() {
  // Construimos los items a partir de los productos que tengan qty > 0
  const items: ItemCarrito[] = this.productos
    .filter(p => (p.qty || 0) > 0)
    .map(p => ({
      productoId: String(p.id),                 // por si viene como ObjectId raro
      nombreActual: p.nombre,
      precioActual: Number(p.precioConIva || 0),
      cantidad: p.qty || 0,
      nota: '',
    }));

  // Guardamos en el store
  this.pedidoStore.guardarItems(items);

  // Navegamos a /pedir
  this.router.navigate(['/pedir']);
}




  logout() {
    this.auth.clear();
    this.router.navigateByUrl('/login');
  }
}
