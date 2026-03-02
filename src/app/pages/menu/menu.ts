import { Component, OnInit } from '@angular/core';
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
  search = '';
  categorias: string[] = ['Entrantes', 'Principales', 'Postres', 'Bebidas'];
  catActiva: string | null = null;
  productos: ProductoVM[] = [];
  mesaId: string | null = null;
  idsRecomendados: string[] = [];
  kcalObjetivoIA: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private menuService: MenuService,
    public auth: AuthService,
    private pedidoStore: PedidoStore,
  ) {}

  get totalItems() {
    return this.pedidoStore.totalItems();
  }

  get totalEuros() {
    return this.pedidoStore.totalEuros();
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe((q) => {
      const m = q.get('modo');
      this.modo = m === 'ver' ? 'ver' : 'armar';
      this.mesaId = q.get('mesa');
      const rec = q.get('recomendados');
      const kcal = q.get('kcal');

      console.log('Que datos recibe menú de backend', rec, kcal);

      this.kcalObjetivoIA = kcal ? Number(kcal) : null;

      this.idsRecomendados = rec
        ? rec
            .split(',')
            .map((id) => id.trim())
            .filter((id) => id.length > 0)
        : [];
      console.log('IDs IA Sincronizados:', this.idsRecomendados);
    });

    this.cargarMenuYSincronizar();
  }

  private categoriaDesdeTags(tags: any): string {
    const t = (Array.isArray(tags) ? tags : []).map((x: any) => String(x).toUpperCase());

    if (t.includes('ENTRANTE')) return 'Entrantes';
    if (t.includes('PRINCIPAL')) return 'Principales';
    if (t.includes('POSTRE')) return 'Postres';
    if (t.includes('BEBIDA')) return 'Bebidas';
    return 'Otros';
  }

  private cargarMenuYSincronizar() {
    this.menuService.getMenu().subscribe({
      next: (resp: any) => {
        // DEBUG: Vamos a ver qué llega exactamente de la API
        console.log('API RESPONSE:', resp);

        const lista = resp.productos || [];
        const itemsEnCarrito = this.pedidoStore.obtenerItems() || [];

        this.productos = lista.map((p: any) => {
          // GENERACIÓN DE ID ULTRA-SIMPLE:
          // Si hay ID lo usamos, si no, el nombre. Siempre a minúsculas y sin espacios.
          const rawId =
            p.id?.$oid ||
            p._id?.$oid ||
            p._id?.hexString || // "" CLAVE para ObjectId Java
            p.id?.hexString ||
            (typeof p.id === 'string' ? p.id : null) ||
            (typeof p._id === 'string' ? p._id : null) ||
            null;
          const idLimpio = rawId ? String(rawId) : '';
          const idEsValido = /^[a-fA-F0-9]{24}$/.test(idLimpio);

          // Sincronizar cantidad
          const coincidencia = itemsEnCarrito.find(
            (i) => String(i.productoId).toLowerCase() === idLimpio && !i.enviado,
          );

          return {
            id: idLimpio,
            nombre: p.nombre || 'Sin nombre',
            descripcion: p.descripcion || '',
            precioConIva: Number(p.precioConIva ?? p.precio ?? 0),
            imagen: p.imagen,
            categoria: this.categoriaDesdeTags(p.tags),
            kcal: p.kcal || 0,
            qty: coincidencia ? Number(coincidencia.cantidad) : 0,
            proteinas: p.proteinas || 0,
            grasas: p.grasas || 0,
            carbohidratos: p.carbohidratos || 0,
          };
        });

        console.log('PRODUCTOS PROCESADOS:', this.productos);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando menú:', err);
        this.loading = false;
      },
    });
  }

  private actualizarStore() {
    const itemsExistentes = this.pedidoStore.obtenerItems();
    const enviados = itemsExistentes.filter((i) => i.enviado);

    // IMPORTANTE: Solo guardamos lo que realmente tiene cantidad > 0
    const nuevos = this.productos
      .filter((p) => p.qty > 0)
      .map((p) => ({
        productoId: p.id,
        nombreActual: p.nombre,
        precioActual: p.precioConIva,
        cantidad: p.qty,
        enviado: false,
        nota: itemsExistentes.find((i) => i.productoId === p.id && !i.enviado)?.nota || '',
      }));

    this.pedidoStore.guardarItems([...enviados, ...nuevos]);
  }

  inc(p: ProductoVM) {
    if (this.modo !== 'armar') return;
    p.qty++;
    this.actualizarStore();
  }

  dec(p: ProductoVM) {
    if (this.modo !== 'armar') return;
    if (p.qty > 0) {
      p.qty--;
      this.actualizarStore();
    }
  }

  // --- MÉTODOS DE APOYO ---

  productosFiltrados(): ProductoVM[] {
    const term = this.search.trim().toLowerCase();

    return this.productos.filter((p) => {
      // 1. Lógica de IA: Si hay recomendados, el producto debe estar en la lista
      let cumpleIA = true;
      if (this.idsRecomendados.length > 0) {
        // Buscamos coincidencia por ID O por el nombre normalizado (como plan B)
        const nombreNormalizado = p.nombre.trim().toLowerCase().replace(/\s+/g, '');
        cumpleIA =
          this.idsRecomendados.includes(p.id) || this.idsRecomendados.includes(nombreNormalizado);
      }

      // 2. Filtros normales (Categoría y Buscador)
      const okCat = !this.catActiva || p.categoria?.toLowerCase() === this.catActiva.toLowerCase();
      const okSearch = !term || (p.nombre + ' ' + p.descripcion).toLowerCase().includes(term);

      return cumpleIA && okCat && okSearch;
    });
  }

  setCat(c: string | null) {
    this.catActiva = c;
  }

  getQty(p: ProductoVM) {
    return p.qty || 0;
  }

  irAPedir() {
    this.router.navigate(['/pedir']);
  }

  limpiarFiltroIA() {
    this.idsRecomendados = [];
    this.router.navigate([], { queryParams: { recomendados: null }, queryParamsHandling: 'merge' });
  }

  logout() {
    this.auth.clear();
    this.router.navigateByUrl('/login');
  }

  trackById(index: number, item: ProductoVM) {
    return item.id;
  }
}
