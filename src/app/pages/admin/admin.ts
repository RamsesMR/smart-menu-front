import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../api/auth-service';
import { AdminProductosService, AdminProducto } from '../../api/admin-productos-service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  private api = inject(AdminProductosService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);

  cargando = signal(false);
  error = signal('');
  search = signal('');
  filtroDisponible = signal<'TODOS' | 'SI' | 'NO'>('TODOS');

  productos = signal<AdminProducto[]>([]);
  editando = signal<AdminProducto | null>(null);
  modalAbierto = signal(false);

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    descripcion: [''],
    precio: [0, [Validators.required, Validators.min(0)]],
    tipoIva: [10, [Validators.required, Validators.min(0), Validators.max(100)]],
    imagen: [''],
    disponible: [true, [Validators.required]],
    kcal: [0, [Validators.min(0), Validators.max(10000)]],
    tags: [''],       // texto "ENTRANTE,PRINCIPAL"
    alergenos: [''],  // texto "gluten,huevo"
    restauranteId: [''],
  });

  ngOnInit() {
    this.cargar();
  }

  logout() {
    this.auth.clear();
    this.router.navigateByUrl('/login');
  }

  private normalizarId(p: any): string {
    const raw =
      p?.id?.hexString ||
      p?.id?.$oid ||
      p?.id ||
      p?._id?.hexString ||
      p?._id?.$oid ||
      p?._id ||
      '';
    return typeof raw === 'string' ? raw : String(raw);
  }

  private parseLista(texto: string): string[] {
    return (texto || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
  }

  private joinLista(arr?: string[]): string {
    return Array.isArray(arr) ? arr.join(', ') : '';
  }

  cargar() {
    this.cargando.set(true);
    this.error.set('');

    this.api.listar().subscribe({
      next: (resp: any) => {
        const lista = Array.isArray(resp) ? resp : resp?.productos || [];
        const normalizados: AdminProducto[] = lista.map((p: any) => ({
          ...p,
          id: this.normalizarId(p),
          disponible: !!p.disponible,
          tags: Array.isArray(p.tags) ? p.tags : [],
          alergenos: Array.isArray(p.alergenos) ? p.alergenos : [],
        }));

        this.productos.set(normalizados);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(e?.error?.message || e?.message || 'Error cargando productos');
        this.cargando.set(false);
      },
    });
  }

  productosFiltrados(): AdminProducto[] {
    const term = this.search().trim().toLowerCase();
    const f = this.filtroDisponible();

    return this.productos().filter((p) => {
      const okSearch =
        !term ||
        (p.nombre + ' ' + (p.descripcion || '')).toLowerCase().includes(term);

      const okDisp =
        f === 'TODOS' ? true : f === 'SI' ? !!p.disponible : !p.disponible;

      return okSearch && okDisp;
    });
  }

  abrirNuevo() {
    this.editando.set(null);
    this.form.reset({
      nombre: '',
      descripcion: '',
      precio: 0,
      tipoIva: 10,
      imagen: '',
      disponible: true,
      kcal: 0,
      tags: '',
      alergenos: '',
      restauranteId: '',
    });
    this.modalAbierto.set(true);
  }

  abrirEditar(p: AdminProducto) {
    this.editando.set(p);
    this.form.reset({
      nombre: p.nombre || '',
      descripcion: p.descripcion || '',
      precio: Number(p.precio ?? 0),
      tipoIva: Number(p.tipoIva ?? 10),
      imagen: p.imagen || '',
      disponible: !!p.disponible,
      kcal: Number(p.kcal ?? 0),
      tags: this.joinLista(p.tags),
      alergenos: this.joinLista(p.alergenos),
      restauranteId: p.restauranteId || '',
    });
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.form.markAsPristine();
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;

    const body: AdminProducto = {
      nombre: String(v.nombre || '').trim(),
      descripcion: String(v.descripcion || ''),
      precio: Number(v.precio ?? 0),
      tipoIva: Number(v.tipoIva ?? 10),
      imagen: String(v.imagen || ''),
      disponible: !!v.disponible,
      kcal: Number(v.kcal ?? 0),
      tags: this.parseLista(String(v.tags || '')).map((x) => x.toUpperCase()),
      alergenos: this.parseLista(String(v.alergenos || '')).map((x) => x.toLowerCase()),
      restauranteId: String(v.restauranteId || '').trim() || undefined,
    };

    this.cargando.set(true);
    this.error.set('');

    const edit = this.editando();

    const obs = edit?.id
      ? this.api.actualizar(edit.id, body)
      : this.api.crear(body);

    obs.subscribe({
      next: () => {
        this.cerrarModal();
        this.cargar();
      },
      error: (e) => {
        this.error.set(e?.error?.message || e?.message || 'Error guardando');
        this.cargando.set(false);
      },
    });
  }

  eliminar(p: AdminProducto) {
    const id = p.id || '';
    if (!id) return;

    if (!confirm(`¿Eliminar "${p.nombre}"?`)) return;

    this.cargando.set(true);
    this.api.eliminar(id).subscribe({
      next: () => this.cargar(),
      error: (e) => {
        this.error.set(e?.error?.message || e?.message || 'Error eliminando');
        this.cargando.set(false);
      },
    });
  }
}