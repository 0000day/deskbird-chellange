import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { initialAuthState } from './auth.state';

// Reducer - WIE sich der State ändert
export const authReducer = createReducer(
  initialAuthState,

  // Wenn Login gestartet wird
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  // Wenn Login erfolgreich
  on(AuthActions.loginSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    isLoggedIn: true,
    loading: false,
    error: null
  })),

  // Wenn Login fehlschlägt
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    isLoggedIn: false
  })),

  // Wenn Logout
  on(AuthActions.logout, () => initialAuthState)
);