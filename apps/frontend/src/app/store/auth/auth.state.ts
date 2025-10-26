// Auth State - WAS wir im Store speichern
export interface AuthState {
  user: any | null;           // Eingeloggter User
  token: string | null;       // JWT Token  
  isLoggedIn: boolean;        // Login-Status
  loading: boolean;           // Lädt gerade?
  error: string | null;       // Fehler-Message
}

// Initial State - Startwerte
export const initialAuthState: AuthState = {
  user: null,
  token: null,
  isLoggedIn: false,
  loading: false,
  error: null
};