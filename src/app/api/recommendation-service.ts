import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { RecommendationRequest, RecommendationResponse } from '../models/recomendation.models';

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/recommendations`;

  obtenerRecomendacion(datos: RecommendationRequest) {
    return this.http.post<RecommendationResponse>(this.url, datos);
  }
}
