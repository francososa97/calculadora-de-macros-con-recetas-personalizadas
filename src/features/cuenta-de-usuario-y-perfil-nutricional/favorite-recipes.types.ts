/**
 * Tipos del sub-dominio "Recetas favoritas por usuario" (E2-T3).
 *
 * Nota: idealmente estos tipos base (UserId, RecipeId) viven en
 * src/shared/types/index.ts y se reexportan desde aqui. Como el barrel
 * compartido aun no existe en el repo, se declaran localmente con la misma
 * forma que tendrian alli para facilitar una migracion posterior.
 */

/** Identificador unico de un usuario. */
export type UserId = string;

/** Identificador unico de una receta. */
export type RecipeId = string;

/** Timestamp en milisegundos desde epoch (Date.now()). */
export type EpochMillis = number;

/**
 * Vinculo persistido entre un usuario y una receta que marco como favorita.
 */
export interface FavoriteRecipe {
  readonly userId: UserId;
  readonly recipeId: RecipeId;
  /** Momento en que el usuario marco la receta como favorita. */
  readonly favoritedAt: EpochMillis;
}

/** Criterios de orden soportados al listar favoritos. */
export type FavoriteSortOrder = 'newest' | 'oldest';

/** Opciones de consulta para listar los favoritos de un usuario. */
export interface ListFavoritesOptions {
  readonly order?: FavoriteSortOrder;
  /** Cantidad maxima de resultados (>= 1). */
  readonly limit?: number;
  /** Cantidad de resultados a saltear desde el inicio (>= 0). */
  readonly offset?: number;
}

/**
 * Contrato de persistencia para favoritos. Permite intercambiar la
 * implementacion (memoria, SQL, etc.) sin tocar el servicio.
 */
export interface FavoriteRecipeRepository {
  add(favorite: FavoriteRecipe): Promise<void>;
  remove(userId: UserId, recipeId: RecipeId): Promise<boolean>;
  exists(userId: UserId, recipeId: RecipeId): Promise<boolean>;
  listByUser(userId: UserId): Promise<readonly FavoriteRecipe[]>;
  countByUser(userId: UserId): Promise<number>;
}

/** Error de dominio para operaciones de favoritos. */
export class FavoriteRecipeError extends Error {
  constructor(
    message: string,
    readonly code: 'INVALID_ARGUMENT' | 'ALREADY_FAVORITED' | 'NOT_FOUND',
  ) {
    super(message);
    this.name = 'FavoriteRecipeError';
  }
}
