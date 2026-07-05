/**
 * Tipos del solver de ajuste de porciones.
 *
 * El solver ajusta la cantidad (en gramos) de los ingredientes de una receta
 * para acercar sus macros totales a un objetivo dado, respetando cotas
 * (min/max) por ingrediente e ingredientes bloqueados.
 *
 * Se reexportan los tipos base desde `src/shared/types` cuando aplican; si el
 * proyecto aún no los define, este módulo declara equivalentes compatibles
 * estructuralmente para que la feature compile de forma autónoma.
 */

/** Los cuatro macronutrientes que el solver optimiza. `calories` es kcal. */
export interface MacroProfile {
  readonly calories: number;
  readonly protein: number;
  readonly carbs: number;
  readonly fat: number;
}

/** Claves iterables de un `MacroProfile`. */
export type MacroKey = keyof MacroProfile;

export const MACRO_KEYS: readonly MacroKey[] = [
  'calories',
  'protein',
  'carbs',
  'fat',
] as const;

/** Un ingrediente tal como lo recibe el solver. */
export interface SolverIngredient {
  readonly id: string;
  readonly name: string;
  /** Macros por cada 100 g del ingrediente. */
  readonly macrosPer100g: MacroProfile;
  /** Gramos actuales (punto de partida de la optimización). */
  readonly grams: number;
  /** Cota inferior de gramos. Por defecto 0. */
  readonly minGrams?: number;
  /** Cota superior de gramos. Por defecto `Infinity`. */
  readonly maxGrams?: number;
  /** Si es `true`, el solver no modifica su cantidad. Por defecto `false`. */
  readonly locked?: boolean;
}

/** Peso relativo de cada macro dentro de la función de costo. */
export type MacroWeights = Partial<Record<MacroKey, number>>;

/** Objetivo de macros y parámetros de la optimización. */
export interface SolverTarget {
  readonly target: MacroProfile;
  /**
   * Importancia relativa de cada macro. Por defecto la proteína pesa más
   * (2) porque suele ser la restricción dura de un plan de recomposición.
   */
  readonly weights?: MacroWeights;
}

/** Parámetros numéricos del algoritmo. Todos tienen defaults sensatos. */
export interface SolverOptions {
  /** Máximo de iteraciones de descenso. Default 500. */
  readonly maxIterations?: number;
  /**
   * Tolerancia de convergencia sobre la mejora relativa del costo entre
   * iteraciones. Default 1e-9.
   */
  readonly tolerance?: number;
  /**
   * Error porcentual por macro por debajo del cual se considera "cumplido".
   * Se usa solo para el reporte (`achievedWithinTolerance`). Default 0.05 (5 %).
   */
  readonly macroTolerancePct?: number;
}

/** Detalle del error alcanzado para un macro concreto. */
export interface MacroError {
  readonly macro: MacroKey;
  readonly target: number;
  readonly achieved: number;
  /** achieved - target. */
  readonly absoluteError: number;
  /** |achieved - target| / max(|target|, 1). */
  readonly relativeError: number;
  readonly withinTolerance: boolean;
}

/** Cantidad final asignada a un ingrediente. */
export interface AdjustedPortion {
  readonly id: string;
  readonly name: string;
  readonly originalGrams: number;
  readonly adjustedGrams: number;
  /** adjustedGrams - originalGrams. */
  readonly deltaGrams: number;
  readonly locked: boolean;
}

/** Resultado completo de una corrida del solver. */
export interface SolverResult {
  readonly portions: readonly AdjustedPortion[];
  readonly achievedMacros: MacroProfile;
  readonly targetMacros: MacroProfile;
  readonly errors: readonly MacroError[];
  /** Costo final (suma ponderada de errores cuadráticos). */
  readonly cost: number;
  readonly iterations: number;
  /** `true` si el descenso convergió antes de agotar `maxIterations`. */
  readonly converged: boolean;
  /** `true` si todos los macros quedaron dentro de `macroTolerancePct`. */
  readonly achievedWithinTolerance: boolean;
}

/** Error de validación de entradas del solver. */
export class SolverInputError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'SolverInputError';
  }
}
