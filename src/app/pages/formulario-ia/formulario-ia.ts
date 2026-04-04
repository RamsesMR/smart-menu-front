import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RecommendationService } from '../../api/recommendation-service';
import {
  DietType,
  GoalType,
  RecommendationRequest,
  RecommendationResponse,
  MenuSuggestion,
} from '../../models/recomendation.models';

@Component({
  selector: 'app-formulario-ia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-ia.html',
  styleUrl: './formulario-ia.css',
})
export class FormularioIa {
  private fb = inject(FormBuilder);
  private recService = inject(RecommendationService);
  private router = inject(Router);

  resultado = signal<RecommendationResponse | null>(null);
  cargando = signal(false);

  form = this.fb.group({
    edad: ['', [Validators.required, Validators.min(12), Validators.max(99)]],
    pesoKg: ['', [Validators.required, Validators.min(30), Validators.max(250)]],
    alturaCm: ['', [Validators.required, Validators.min(100), Validators.max(250)]],
    dieta: [DietType.NORMAL, Validators.required],
    objetivo: [GoalType.MANTENER, Validators.required],
    incluirBebida: [true],
  });

  enviarConsulta() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);

    const payload: RecommendationRequest = {
      restauranteId: '69c6670723460751ed2e1038',
      edad: Number(this.form.value.edad),
      pesoKg: Number(this.form.value.pesoKg),
      alturaCm: Number(this.form.value.alturaCm),
      sexo: 'HOMBRE',
      dieta: this.form.value.dieta as DietType,
      objetivo: this.form.value.objetivo as GoalType,
      alergenosEvitar: [],
      kcalObjetivo: null,
      incluirBebida: Boolean(this.form.value.incluirBebida),
    };

    console.log('Enviado a IA:', payload);

    this.recService.obtenerRecomendacion(payload).subscribe({
      next: (res) => {
        console.log('Datos recibidos de la IA:', JSON.stringify(res, null, 2));
        this.resultado.set(res);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error IA:', err);
        this.cargando.set(false);
      },
    });
  }

verDetalle(menu: MenuSuggestion) {
  const resActual = this.resultado();
  if (!resActual) return;

  console.log('menu.productos completos:', menu.productos);

  const ids = menu.productos
    .map((p: any) => {
      if (typeof p.id === 'string') return p.id;
      if (p.id?.timestamp) return p.id.timestamp?.toString();
      if (p._id && typeof p._id === 'string') return p._id;
      return null;
    })
    .filter((id: string | null) => !!id)
    .join(',');

  console.log('IDs limpios para la URL:', ids);

  this.router.navigate(['/menu'], {
    queryParams: {
      modo: 'armar',
      recomendados: ids,
      kcal: resActual.kcalObjetivo,
    },
  });
}

  irAlInicio() {
    this.router.navigate(['/inicio']);
  }
}