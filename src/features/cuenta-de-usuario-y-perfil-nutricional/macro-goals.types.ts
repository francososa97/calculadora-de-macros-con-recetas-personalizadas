/**
 * E2-T2 — Formulario de objetivos de macros del usuario.
 * Tipos del dominio para los objetivos de macronutrientes.
 *
 * Nota: cuando `src/shared/types/index.ts` exponga tipos base de usuario
 * (p. ej. `UserId`, `Grams`, `Kcal`), reemplazar los alias locales por
 * los compartidos y re-exportarlos desde aquí.
 */

/** Kilocalorías por gramo de cada macronutriente (estándar Atwater). */
export const KCAL_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
} as const;

/** Objetivo de composición corporal que persigue el usuario. */
export type GoalType = 'lose_fat' | 'gain_muscle' | 'maintain';

/** Alias semánticos (se migrarán a shared/types cuando existan). */
export type Grams = number;
export type Kcal = number;

/**
 * Entrada cruda del formulario. Todos los campos son opcionales/parciales
 * porque el usuario los va completando de a poco en la UI.
 */
export interface MacroGoalsInput {
  goalType?: GoalType;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  /**
   * Objetivo calórico declarado por el usuario (opcional).
   * Si no se provee, se deriva de los gramos de macros.
   */
  calorieTarget?: number;
}

/** Objetivos de macros ya validados y normalizados. */
export interface MacroGoals {
  goalType: GoalType;
  proteinGrams: Grams;
  carbsGrams: Grams;
  fatGrams: Grams;
  /** Calorías totales derivadas de los gramos de macros. */
  calorieTarget: Kcal;
}

/** Distribución porcentual de calorías por macronutriente (suma ≈ 100). */
export interface MacroDistribution {
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
}

/** Campos del formulario susceptibles de tener error. */
export type MacroGoalsField =
  | 'goalType'
  | 'proteinGrams'
  | 'carbsGrams'
  | 'fatGrams'
  | 'calorieTarget';

/** Error de validación asociado a un campo concreto. */
export interface ValidationError {
  field: MacroGoalsField;
  message: string;
}

/** Resultado discriminado de una validación. */
export type ValidationResult =
  | { readonly ok: true; readonly value: MacroGoals }
  | { readonly ok: false; readonly errors: readonly ValidationError[] };
