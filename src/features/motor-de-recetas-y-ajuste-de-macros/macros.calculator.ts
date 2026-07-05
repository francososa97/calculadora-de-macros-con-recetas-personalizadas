// Motor de cálculo de macronutrientes.
// Lógica de dominio pura (sin dependencias de framework) para poder testearla y
// reutilizarla desde el router tRPC (ver macros.router.ts).

/** Sexo biológico usado por la ecuación de Mifflin-St Jeor. */
export type BiologicalSex = 'male' | 'female';

/**
 * Nivel de actividad física semanal.
 * El valor asociado es el multiplicador estándar del TDEE.
 */
export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

/** Objetivo de composición corporal del usuario. */
export type MacroGoal = 'lose_fat' | 'maintain' | 'gain_muscle';

/** Datos de entrada necesarios para el cálculo. */
export interface MacroCalculationInput {
  /** Edad en años (cumplidos). */
  readonly age: number;
  /** Sexo biológico. */
  readonly sex: BiologicalSex;
  /** Peso corporal en kilogramos. */
  readonly weightKg: number;
  /** Altura en centímetros. */
  readonly heightCm: number;
  /** Nivel de actividad física. */
  readonly activityLevel: ActivityLevel;
  /** Objetivo de composición corporal. */
  readonly goal: MacroGoal;
}

/** Reparto de macronutrientes en gramos y calorías. */
export interface MacroBreakdown {
  /** Gramos diarios de proteína. */
  readonly proteinGrams: number;
  /** Gramos diarios de grasa. */
  readonly fatGrams: number;
  /** Gramos diarios de carbohidratos. */
  readonly carbGrams: number;
}

/** Resultado completo del cálculo. */
export interface MacroCalculationResult {
  /** Metabolismo basal (kcal/día) — Mifflin-St Jeor. */
  readonly bmr: number;
  /** Gasto energético total diario (kcal/día). */
  readonly tdee: number;
  /** Calorías objetivo tras aplicar el ajuste por objetivo (kcal/día). */
  readonly targetCalories: number;
  /** Reparto de macros que suma las calorías objetivo. */
  readonly macros: MacroBreakdown;
}

/** Kilocalorías por gramo de cada macronutriente. */
const KCAL_PER_GRAM = {
  protein: 4,
  carb: 4,
  fat: 9,
} as const;

/** Multiplicadores de actividad aplicados sobre el BMR para obtener el TDEE. */
const ACTIVITY_MULTIPLIERS: Readonly<Record<ActivityLevel, number>> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/**
 * Configuración por objetivo:
 *  - calorieFactor: ajuste multiplicativo sobre el TDEE.
 *  - proteinPerKg: gramos de proteína por kg de peso corporal.
 *  - fatFactor: fracción de las calorías objetivo destinada a grasa.
 */
const GOAL_CONFIG: Readonly<
  Record<MacroGoal, { calorieFactor: number; proteinPerKg: number; fatFactor: number }>
> = {
  lose_fat: { calorieFactor: 0.8, proteinPerKg: 2.2, fatFactor: 0.25 },
  maintain: { calorieFactor: 1.0, proteinPerKg: 1.8, fatFactor: 0.3 },
  gain_muscle: { calorieFactor: 1.1, proteinPerKg: 2.0, fatFactor: 0.25 },
};

/** Redondea a un número entero de forma segura. */
function round(value: number): number {
  return Math.round(value);
}

/**
 * Calcula el metabolismo basal (BMR) con la ecuación de Mifflin-St Jeor.
 * male:   10*kg + 6.25*cm - 5*edad + 5
 * female: 10*kg + 6.25*cm - 5*edad - 161
 */
export function calculateBmr(input: MacroCalculationInput): number {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
  return input.sex === 'male' ? base + 5 : base - 161;
}

/** Calcula el gasto energético total diario (TDEE) a partir del BMR. */
export function calculateTdee(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

/**
 * Reparte las calorías objetivo en macros:
 *  1. Proteína fijada por kg de peso corporal.
 *  2. Grasa como fracción de las calorías objetivo.
 *  3. Carbohidratos con las calorías restantes (nunca negativo).
 */
export function distributeMacros(
  targetCalories: number,
  weightKg: number,
  goal: MacroGoal,
): MacroBreakdown {
  const config = GOAL_CONFIG[goal];

  const proteinGrams = config.proteinPerKg * weightKg;
  const proteinCalories = proteinGrams * KCAL_PER_GRAM.protein;

  const fatCalories = targetCalories * config.fatFactor;
  const fatGrams = fatCalories / KCAL_PER_GRAM.fat;

  const remainingCalories = Math.max(0, targetCalories - proteinCalories - fatCalories);
  const carbGrams = remainingCalories / KCAL_PER_GRAM.carb;

  return {
    proteinGrams: round(proteinGrams),
    fatGrams: round(fatGrams),
    carbGrams: round(carbGrams),
  };
}

/**
 * Punto de entrada del motor: valida rangos y devuelve el desglose completo
 * (BMR, TDEE, calorías objetivo y macros).
 *
 * @throws {RangeError} si algún valor numérico está fuera de un rango razonable.
 */
export function calculateMacros(input: MacroCalculationInput): MacroCalculationResult {
  assertValidInput(input);

  const bmr = calculateBmr(input);
  const tdee = calculateTdee(bmr, input.activityLevel);
  const targetCalories = tdee * GOAL_CONFIG[input.goal].calorieFactor;
  const macros = distributeMacros(targetCalories, input.weightKg, input.goal);

  return {
    bmr: round(bmr),
    tdee: round(tdee),
    targetCalories: round(targetCalories),
    macros,
  };
}

/** Valida que los datos antropométricos estén en rangos fisiológicamente plausibles. */
function assertValidInput(input: MacroCalculationInput): void {
  if (input.age < 14 || input.age > 100) {
    throw new RangeError('age debe estar entre 14 y 100 años');
  }
  if (input.weightKg < 30 || input.weightKg > 300) {
    throw new RangeError('weightKg debe estar entre 30 y 300 kg');
  }
  if (input.heightCm < 120 || input.heightCm > 250) {
    throw new RangeError('heightCm debe estar entre 120 y 250 cm');
  }
}
