import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../api/menu-service';
import { AuthService } from '../../api/auth-service';
import { PedidoStore, ItemCarrito } from '../../state/pedido.store';

type ProductoVM = {
  id: string;
  nombre: string;
  descripcion: string;
  precioConIva: number;
  imagen?: string;
  categoria?: string;
  qty: number;
  kcal?: number;
  proteinas?: number;
  grasas?: number;
  carbohidratos?: number;
};

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './menu.html',
  styleUrls: ['./menu.css'],
})
export class Menu implements OnInit {
  loading = true;
  modo: 'ver' | 'armar' = 'ver';
  categorias: string[] = ['Entrantes', 'Principales', 'Postres', 'Bebidas'];
  productos: ProductoVM[] = [];
  mesaId: string | null = null;
  idsRecomendados: string[] = [];
  kcalObjetivoIA: number | null = null;

  // Signals
  search = signal('');
  catActiva = signal<string | null>(null);
  qtys = signal<{ [id: string]: number }>({});

  // Computados reactivos
  totalItems = computed(() =>
    Object.values(this.qtys()).reduce((acc, qty) => acc + qty, 0),
  );

  totalEuros = computed(() =>
    this.productos.reduce(
      (acc, p) => acc + (this.qtys()[p.id] || 0) * p.precioConIva,
      0,
    ),
  );

  productosFiltrados = computed(() => {
  const term = this.search().trim().toLowerCase();
  const qtys = this.qtys(); // dependencia con el signal

  return this.productos
    .filter((p) => {
      const cumpleIA =
        this.idsRecomendados.length === 0 ||
        this.idsRecomendados.includes(p.id);
      const okCat =
        !this.catActiva() ||
        p.categoria?.toLowerCase() === this.catActiva()!.toLowerCase();
      const okSearch =
        !term || `${p.nombre} ${p.descripcion}`.toLowerCase().includes(term);
      return cumpleIA && okCat && okSearch;
    })
    .map(p => ({ ...p, qty: qtys[p.id] || 0 })); // qty embebido en cada objeto
});

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private menuService: MenuService,
    public auth: AuthService,
    private pedidoStore: PedidoStore,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((q) => {
      const m = q.get('modo');
      this.modo = m === 'ver' ? 'ver' : 'armar';
      this.mesaId = q.get('mesa');
      const rec = q.get('recomendados');
      const kcal = q.get('kcal');
      this.kcalObjetivoIA = kcal ? Number(kcal) : null;
      this.idsRecomendados = rec
        ? rec.split(',').map((id) => id.trim()).filter((id) => id.length > 0)
        : [];
      console.log('Query params menú:', {
        modo: this.modo,
        mesa: this.mesaId,
        recomendados: this.idsRecomendados,
        kcal: this.kcalObjetivoIA,
      });
      this.cargarMenuYSincronizar();
    });
  }

  private categoriaDesdeTags(tags: any): string {
    const t = (Array.isArray(tags) ? tags : []).map((x: any) =>
      String(x).toUpperCase(),
    );
    if (t.includes('ENTRANTE')) return 'Entrantes';
    if (t.includes('PRINCIPAL')) return 'Principales';
    if (t.includes('POSTRE')) return 'Postres';
    if (t.includes('BEBIDA')) return 'Bebidas';
    return 'Otros';
  }

  private extraerIdProducto(p: any): string {
    const rawId =
      p?.id?.$oid ||
      p?._id?.$oid ||
      p?._id?.hexString ||
      p?.id?.hexString ||
      (typeof p?.id === 'string' ? p.id : null) ||
      (typeof p?._id === 'string' ? p._id : null) ||
      null;
    return rawId ? String(rawId).trim() : '';
  }

  private cargarMenuYSincronizar(): void {
    this.loading = true;

    this.menuService.getMenu().subscribe({
      next: (resp: any) => {
        console.log('API RESPONSE /producto:', resp);
        const lista = Array.isArray(resp) ? resp : resp?.productos || [];
        const carrito = this.pedidoStore.obtenerItems() || [];

        this.productos = lista
          .map((p: any) => {
            const idLimpio = this.extraerIdProducto(p);
            return {
              id: idLimpio,
              nombre: p.nombre || 'Sin nombre',
              descripcion: p.descripcion || '',
              precioConIva: Number(p.precioConIva ?? p.precio ?? 0),
              imagen: p.imagen,
              categoria: p.categoria || this.categoriaDesdeTags(p.tags),
              qty: 0,
              kcal: Number(p.kcal ?? 0),
              proteinas: Number(p.proteinas ?? 0),
              grasas: Number(p.grasas ?? 0),
              carbohidratos: Number(p.carbohidratos ?? 0),
            } as ProductoVM;
          })
          .filter((p: ProductoVM) => p.id.length > 0);

        const inicial: { [id: string]: number } = {};
        carrito.forEach((item) => {
          if (!item.enviado) {
            inicial[item.productoId.trim()] = Number(item.cantidad || 0);
          }
        });
        this.qtys.set(inicial);

        console.log('PRODUCTOS PROCESADOS:', this.productos);
        console.log('IDS sincronizados:', this.idsRecomendados);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando menú:', err);
        this.loading = false;
      },
    });
  }

  private actualizarStore(): void {
    const itemsExistentes = this.pedidoStore.obtenerItems() || [];
    const enviados = itemsExistentes.filter((i) => i.enviado);

    const nuevos: ItemCarrito[] = this.productos
      .filter((p) => (this.qtys()[p.id] || 0) > 0)
      .map((p) => {
        const anterior = itemsExistentes.find(
          (i) =>
            !i.enviado &&
            i.productoId.trim().toLowerCase() === p.id.toLowerCase(),
        );
        return {
          productoId: p.id,
          nombreActual: p.nombre,
          precioActual: p.precioConIva,
          cantidad: this.qtys()[p.id] || 0,
          enviado: false,
          nota: anterior?.nota || '',
          kcal: p.kcal || 0,
        };
      });

    this.pedidoStore.guardarItems([...enviados, ...nuevos]);
  }

  inc(p: ProductoVM, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    if (this.modo !== 'armar') return;

    this.qtys.update((prev) => ({ ...prev, [p.id]: (prev[p.id] || 0) + 1 }));
    this.actualizarStore();
    console.log('SUMAR', p.nombre, this.qtys()[p.id]);
  }

  dec(p: ProductoVM, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    if (this.modo !== 'armar') return;

    this.qtys.update((prev) => ({
      ...prev,
      [p.id]: Math.max(0, (prev[p.id] || 0) - 1),
    }));
    this.actualizarStore();
    console.log('RESTAR', p.nombre, this.qtys()[p.id]);
  }

  // Guardamos en el store
  this.pedidoStore.guardarItems(items);

  // Navegamos a /pedir
  this.router.navigate(['/pedir']);
}


  irAPedir(): void {
    this.router.navigate(['/pedir']);
  }

  limpiarFiltroIA(): void {
    this.idsRecomendados = [];
    this.router.navigate([], {
      queryParams: { recomendados: null, kcal: null },
      queryParamsHandling: 'merge',
    });
  }

  logout(): void {
    this.auth.clear();
    this.router.navigateByUrl('/login');
  }

  trackById(index: number, item: ProductoVM): string {
    return item.id;
  }
}