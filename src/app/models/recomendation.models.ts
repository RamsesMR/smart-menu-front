/** * Clasificación de regímenes alimenticios disponibles.
 * * Determina qué tipos de productos del menú son aptos para el usuario.
 */
export enum DietType {
  NORMAL = 'NORMAL',
  VEGETARIANA = 'VEGETARIANA',
  VEGANA = 'VEGANA',
}

/** * Define el propósito nutricional del plan de alimentación.
 * * Afecta al cálculo de las Kcal objetivo y la distribución de macros.
 */
export enum GoalType {
  PERDER_PESO = 'PERDER_PESO',
  MANTENER = 'MANTENER',
  GANAR_MUSCULO = 'GANAR_MUSCULO',
}

/**
 * DTO (Data Transfer Object) para solicitar una recomendación personalizada a la IA.
 * * Reúne datos biométricos y preferencias del comensal.
 */
export interface RecommendationRequest {
  restauranteId?: string;
  edad: number;
  pesoKg: number;
  alturaCm: number;
  dieta: DietType;
  objetivo: GoalType;
  alergenosEvitar: string[];
  kcalObjetivo: number;
  incluirBebida: boolean;
}

/**
 * Estructura de una combinación de platos sugerida por el motor de IA.
 */
export interface MenuSuggestion {
  productos: any[];
  kcalTotal: number;
  proteTotal: number;
}

/**
 * Respuesta final del servicio de recomendaciones.
 * * Contiene múltiples opciones de menú que cumplen con el perfil del usuario.
 */
export interface RecommendationResponse {
  kcalObjetivo: number;
  menus: MenuSuggestion[];
}
