export enum DietType {
  NORMAL = 'NORMAL',
  VEGETARIANA = 'VEGETARIANA',
  VEGANA = 'VEGANA',
}

export enum GoalType {
  PERDER_PESO = 'PERDER_PESO',
  MANTENER = 'MANTENER',
  GANAR_MUSCULO = 'GANAR_MUSCULO',
}

export type Sexo = 'HOMBRE' | 'MUJER';

export interface RecommendationRequest {
  restauranteId?: string;
  edad: number;
  pesoKg: number;
  alturaCm: number;
  sexo: Sexo;
  dieta: DietType;
  objetivo: GoalType;
  alergenosEvitar: string[];
  kcalObjetivo: number | null;
  incluirBebida: boolean;
}

export interface ProductoRecomendado {
  id?: string;
  nombre: string;
  descripcion?: string;
  precio?: number;
  precioConIva?: number;
  imagen?: string;
  categoria?: string;
  kcal?: number;
  proteinas?: number;
  grasas?: number;
  carbohidratos?: number;
}

export interface MenuSuggestion {
  productos: ProductoRecomendado[];
  kcalTotal: number;
  proteTotal: number;
}

export interface RecommendationResponse {
  kcalObjetivo: number;
  menus: MenuSuggestion[];
}