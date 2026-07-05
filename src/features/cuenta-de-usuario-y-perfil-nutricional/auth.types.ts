// Tipos de dominio para la integración de auth gestionada (managed auth).
// Definidos localmente porque son propios de esta feature; los tipos
// transversales (ej. UserId) se re-exportan desde shared cuando existan.

/** Identificador único de usuario provisto por el proveedor de auth gestionado. */
export type UserId = string;

/** Proveedores de identidad soportados por la auth gestionada. */
export type AuthProvider = 'email' | 'google' | 'apple';

/** Usuario autenticado, normalizado desde el proveedor gestionado. */
export interface AuthUser {
  readonly id: UserId;
  readonly email: string;
  readonly emailVerified: boolean;
  readonly provider: AuthProvider;
  readonly createdAt: string; // ISO-8601
}

/** Sesión activa devuelta tras un login/signup exitoso. */
export interface AuthSession {
  readonly user: AuthUser;
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: number; // epoch ms
}

/** Credenciales para el flujo email + password. */
export interface EmailCredentials {
  readonly email: string;
  readonly password: string;
}

/** Códigos de error estables, independientes del proveedor concreto. */
export type AuthErrorCode =
  | 'invalid_credentials'
  | 'email_already_in_use'
  | 'weak_password'
  | 'invalid_email'
  | 'session_expired'
  | 'provider_unavailable'
  | 'unknown';

/** Error de dominio de auth, con código estable para la capa de UI. */
export class AuthError extends Error {
  public readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    // Mantiene la cadena de prototipos correcta al transpilar a ES5/ES6.
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

/**
 * Contrato del proveedor de auth gestionado (Supabase, Clerk, Auth0, etc.).
 * Aislar el SDK externo detrás de este puerto permite testear la feature
 * con un doble y cambiar de proveedor sin tocar la lógica de negocio.
 */
export interface ManagedAuthAdapter {
  signUpWithEmail(credentials: EmailCredentials): Promise<AuthSession>;
  signInWithEmail(credentials: EmailCredentials): Promise<AuthSession>;
  signInWithOAuth(provider: Exclude<AuthProvider, 'email'>): Promise<AuthSession>;
  signOut(accessToken: string): Promise<void>;
  refreshSession(refreshToken: string): Promise<AuthSession>;
  getUser(accessToken: string): Promise<AuthUser | null>;
}
