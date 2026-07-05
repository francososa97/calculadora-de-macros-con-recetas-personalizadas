// Tipos de dominio para la experiencia de búsqueda y visualización de recetas.
// En cuanto exista src/shared/types/index.ts con estos modelos, reemplazar
// estas definiciones por imports desde '@/shared/types'.

/** Macronutrientes de una receta o porción, expresados en gramos (kcal para energía). */
export interface Macros {
  /** Energía total en kilocalorías. */
  readonly calorias: number;
  /** Proteínas en gramos. */
  readonly proteinas: number;
  /** Carbohidratos en gramos. */
  readonly carbohidratos: number;
  /** Grasas en gramos. */
  readonly grasas: number;
}

/** Receta lista para mostrarse en la grilla de resultados. */
export interface Recipe {
  readonly id: string;
  readonly nombre: string;
  readonly descripcion: string;
  /** URL de la imagen de portada. Puede faltar para recetas sin foto. */
  readonly imagenUrl?: string;
  /** Tiempo de preparación en minutos. */
  readonly tiempoPreparacionMin: number;
  /** Cantidad de porciones que rinde la receta. */
  readonly porciones: number;
  /** Macros por porción. */
  readonly macrosPorPorcion: Macros;
  /** Etiquetas libres (ej: 'alto en proteína', 'sin gluten'). */
  readonly etiquetas: readonly string[];
}

/**
 * Estado de una operación asíncrona de datos, modelado como unión discriminada
 * para forzar el manejo exhaustivo de carga / error / éxito en la UI.
 */
export type AsyncState<T> =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly error: string }
  | { readonly status: 'success'; readonly data: T };

/** Estado concreto de la búsqueda de recetas: éxito contiene la lista de resultados. */
export type RecipeSearchState = AsyncState<readonly Recipe[]>;
