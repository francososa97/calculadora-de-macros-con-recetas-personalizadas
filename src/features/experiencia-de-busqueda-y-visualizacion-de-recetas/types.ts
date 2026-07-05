// Domain and query types for the recipe search & listing experience (E3-T1).
// These mirror what would live in src/shared/types/index.ts; when that module
// exists, re-export from there instead of redeclaring.

/** Macronutrient breakdown for a single serving of a recipe. */
export interface Macros {
  /** Kilocalories per serving. */
  readonly calories: number;
  /** Grams of protein per serving. */
  readonly protein: number;
  /** Grams of carbohydrates per serving. */
  readonly carbs: number;
  /** Grams of fat per serving. */
  readonly fat: number;
}

/** High-level meal classification used for filtering. */
export type MealCategory =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'dessert';

/** A user-facing recipe as shown in the listing/search page. */
export interface Recipe {
  readonly id: string;
  readonly title: string;
  /** Short description shown in the card. */
  readonly description: string;
  readonly category: MealCategory;
  /** Free-form tags, e.g. 'high-protein', 'vegan', 'meal-prep'. */
  readonly tags: readonly string[];
  /** Total preparation + cooking time in minutes. */
  readonly prepTimeMinutes: number;
  /** Macros for one serving. */
  readonly macrosPerServing: Macros;
  /** Number of servings the recipe yields. */
  readonly servings: number;
  /** ISO-8601 creation timestamp, used for the 'newest' sort. */
  readonly createdAt: string;
}

/** Fields the listing can be sorted by. */
export type RecipeSortField =
  | 'relevance'
  | 'title'
  | 'calories'
  | 'protein'
  | 'prepTime'
  | 'newest';

export type SortDirection = 'asc' | 'desc';

/** Inclusive numeric range filter. Either bound may be omitted. */
export interface NumericRange {
  readonly min?: number;
  readonly max?: number;
}

/** All parameters that drive the search/listing view. */
export interface RecipeSearchQuery {
  /** Free-text query matched against title, description and tags. */
  readonly text?: string;
  /** Restrict to these categories (empty/undefined = all). */
  readonly categories?: readonly MealCategory[];
  /** Recipe must contain every one of these tags. */
  readonly tags?: readonly string[];
  /** Per-serving calorie range filter. */
  readonly calories?: NumericRange;
  /** Per-serving protein (g) range filter. */
  readonly protein?: NumericRange;
  /** Max total prep time in minutes. */
  readonly maxPrepTimeMinutes?: number;
  readonly sortBy?: RecipeSortField;
  readonly sortDirection?: SortDirection;
  /** 1-based page number. Defaults to 1. */
  readonly page?: number;
  /** Items per page. Defaults to 12. */
  readonly pageSize?: number;
}

/** A recipe annotated with its computed search relevance score. */
export interface ScoredRecipe {
  readonly recipe: Recipe;
  /** Higher is more relevant. 0 when no text query is present. */
  readonly score: number;
}

/** Paginated, filtered result returned to the listing page. */
export interface RecipeSearchResult {
  readonly items: readonly Recipe[];
  /** Total matches across all pages (before pagination). */
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}
