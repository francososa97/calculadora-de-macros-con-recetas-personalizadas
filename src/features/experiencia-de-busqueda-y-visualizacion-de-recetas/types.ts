// Tipos del dominio para la página de detalle de receta con ajuste de macros en vivo.
// Se definen aquí porque src/shared/types/index.ts aún no expone estos contratos;
// cuando exista, re-exportar desde el shared y consumir desde aquí.

/** Los cuatro macronutrientes base + calorías derivadas. */
export interface MacroNutrients {
  /** Kilocalorías totales. */
  readonly calories: number;
  /** Gramos de proteína. */
  readonly protein: number;
  /** Gramos de carbohidratos. */
  readonly carbs: number;
  /** Gramos de grasa. */
  readonly fat: number;
  /** Gramos de fibra (opcional, no todas las recetas lo aportan). */
  readonly fiber?: number;
}

/** Clave de un macronutriente escalable (excluye calories, que es derivada). */
export type ScalableMacroKey = 'protein' | 'carbs' | 'fat' | 'fiber';

/** Receta tal como se muestra en la página de detalle. */
export interface RecipeDetail {
  readonly id: string;
  readonly title: string;
  /** Cantidad de porciones con las que la receta fue formulada. Debe ser > 0. */
  readonly baseServings: number;
  /** Macros del total de la receta a `baseServings` porciones. */
  readonly totalMacros: MacroNutrients;
}

/** Objetivo diario de macros del usuario (para calcular progreso). */
export type DailyMacroGoal = MacroNutrients;

/** Resultado de un ajuste de macros en vivo para una cantidad de porciones dada. */
export interface MacroAdjustmentResult {
  /** Porciones solicitadas (normalizadas, siempre > 0). */
  readonly servings: number;
  /** Factor aplicado respecto a `baseServings`. */
  readonly scaleFactor: number;
  /** Macros del total escalado a `servings`. */
  readonly totalMacros: MacroNutrients;
  /** Macros por una sola porción (independiente de `servings`). */
  readonly perServingMacros: MacroNutrients;
}

/** Progreso de una porción/plato contra el objetivo diario del usuario. */
export interface MacroGoalProgress {
  /** Porcentaje 0..100+ cubierto por macro. Puede superar 100 si excede el objetivo. */
  readonly percentages: Record<keyof MacroNutrients, number>;
  /** Gramos/kcal restantes por macro (0 si ya se alcanzó o superó). */
  readonly remaining: MacroNutrients;
}
