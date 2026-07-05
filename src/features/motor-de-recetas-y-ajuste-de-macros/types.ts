/**
 * Motor de Recetas y Ajuste de Macros — Esquema de datos (E1-T1)
 *
 * Tipos de dominio para el trackeo de macronutrientes, ingredientes y recetas.
 * Todos los valores de macros se expresan en gramos salvo la energía (kcal).
 * Las cantidades de ingredientes se almacenan siempre en gramos para permitir
 * cálculos deterministas; la conversión desde unidades "de cocina" (tazas,
 * cucharadas, unidades) se resuelve mediante `MeasureUnit` + factor.
 */

/** Identificador opaco tipado para evitar mezclar ids de entidades distintas. */
export type Id<TBrand extends string> = string & { readonly __brand: TBrand };

export type IngredientId = Id<'Ingredient'>;
export type RecipeId = Id<'Recipe'>;
export type UserId = Id<'User'>;

/** Objetivo de composición corporal del usuario. */
export type Goal = 'lose_fat' | 'gain_muscle' | 'maintain';

/** Nivel de actividad usado en el cálculo de requerimiento energético. */
export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export type Sex = 'male' | 'female';

/** Unidades soportadas para expresar la cantidad de un ingrediente. */
export type MeasureUnit = 'g' | 'ml' | 'unit' | 'cup' | 'tbsp' | 'tsp';

/** Categoría de comida a la que puede asignarse una receta. */
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/**
 * Los cuatro macronutrientes trackeados más la energía derivada.
 * `kcal` es redundante con los gramos pero se persiste para evitar recalcular
 * y para tolerar ingredientes con densidad calórica no estándar (alcohol, fibra).
 */
export interface MacroNutrients {
  readonly kcal: number;
  readonly proteinG: number;
  readonly carbsG: number;
  readonly fatG: number;
  readonly fiberG: number;
}

/**
 * Ingrediente base del catálogo. Los macros se definen por 100 g de porción
 * comestible, que es la convención de las tablas nutricionales (USDA/BEDCA).
 */
export interface Ingredient {
  readonly id: IngredientId;
  readonly name: string;
  /** Macros por cada 100 g de alimento. */
  readonly per100g: MacroNutrients;
  /**
   * Densidad para convertir volumen a masa (g por ml). Requerido si el
   * ingrediente se mide por volumen (`ml`, `cup`, etc.). Ej: aceite ≈ 0.92.
   */
  readonly densityGPerMl?: number;
  /** Peso en gramos de 1 unidad (ej: 1 huevo ≈ 55 g). Requerido para `unit`. */
  readonly gramsPerUnit?: number;
  readonly tags?: readonly string[];
}

/** Uso concreto de un ingrediente dentro de una receta, con su cantidad. */
export interface RecipeIngredient {
  readonly ingredientId: IngredientId;
  readonly quantity: number;
  readonly unit: MeasureUnit;
}

/**
 * Receta personalizada. `servings` permite escalar los macros por porción.
 * `macrosPerServing` es un campo derivado/cacheado que puede recomputarse a
 * partir de los ingredientes con el servicio de cálculo.
 */
export interface Recipe {
  readonly id: RecipeId;
  readonly ownerId: UserId;
  readonly name: string;
  readonly mealTypes: readonly MealType[];
  readonly servings: number;
  readonly ingredients: readonly RecipeIngredient[];
  readonly macrosPerServing?: MacroNutrients;
  readonly createdAt: string;
}

/** Objetivo diario de macros que el usuario intenta cumplir. */
export interface MacroTargets {
  readonly kcal: number;
  readonly proteinG: number;
  readonly carbsG: number;
  readonly fatG: number;
}

/** Perfil del usuario usado para calcular y ajustar sus targets. */
export interface UserProfile {
  readonly id: UserId;
  readonly sex: Sex;
  readonly age: number;
  readonly heightCm: number;
  readonly weightKg: number;
  readonly activityLevel: ActivityLevel;
  readonly goal: Goal;
  /** Targets vigentes; pueden derivarse del perfil o fijarse manualmente. */
  readonly targets: MacroTargets;
}
