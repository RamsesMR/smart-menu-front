import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // Importa el Router
import { RecommendationService } from '../../api/recommendation-service';
import {
  DietType,
  GoalType,
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
  private router = inject(Router); // Inyecta el Router

  resultado = signal<RecommendationResponse | null>(null);
  cargando = signal(false);

  form = this.fb.group({
    // Campo: [Valor inicial, [Lista de validadores]]
    edad: ['', [Validators.required, Validators.min(12), Validators.max(99)]],
    pesoKg: ['', [Validators.required, Validators.min(30), Validators.max(250)]],
    alturaCm: ['', [Validators.required, Validators.min(100), Validators.max(250)]],
    dieta: [DietType.NORMAL, Validators.required],
    objetivo: [GoalType.MANTENER, Validators.required],
    kcalObjetivo: [2000, [Validators.required, Validators.min(500), Validators.max(5000)]],
    incluirBebida: [true],
  });

  enviarConsulta() {
    if (this.form.valid) {
      this.cargando.set(true);

      const payload: any = {
        edad: Number(this.form.value.edad),
        peso: Number(this.form.value.pesoKg),
        altura: Number(this.form.value.alturaCm),
        objetivo: this.form.value.objetivo,
        restauranteId: '67b864a6a578a10f0891d4e4',
      };

      console.log('Enviado a IA :', payload);

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
  }

  verDetalle(menu: MenuSuggestion) {
    const resActual = this.resultado();
    if (!resActual) return;

    const ids = menu.productos
      .map((p: any) => p.id)
      .filter((id) => !!id)
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
