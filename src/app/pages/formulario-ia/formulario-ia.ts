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
        ...this.form.value,
        restauranteId: '696ba6825fe46fff9ddceb06',
        alergenosEvitar: [],
      };

      this.recService.obtenerRecomendacion(payload).subscribe({
        next: (res) => {
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
    // Verificamos qué es 'p' para extraer el texto
    const ids = menu.productos
      .map((p: any) => {
        // Si el backend te envía objetos, necesitamos p.nombre
        // Usamos el nombre porque es lo que tu menú usa para generar el ID 'patatasbravas'
        const valorParaId = p.nombre || p.id || '';

        return String(valorParaId).trim().toLowerCase().replace(/\s+/g, ''); // Quita espacios
      })
      .filter((id) => id.length > 0) // Quita vacíos
      .join(',');

    console.log('IDs limpios para la URL:', ids);

    this.router.navigate(['/menu'], {
      queryParams: {
        modo: 'armar',
        recomendados: ids,
      },
    });
  }

  irAlInicio() {
    this.router.navigate(['/inicio']);
  }
}
