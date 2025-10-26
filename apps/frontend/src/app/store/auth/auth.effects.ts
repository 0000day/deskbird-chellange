import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService
  ) {}

  // Login Effect
  login$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.authService.login({ email, password }).pipe(
          map(response => 
            AuthActions.loginSuccess({ 
              user: response.user, 
              token: response.access_token 
            })
          ),
          catchError(error => 
            of(AuthActions.loginFailure({ 
              error: error.error?.message || 'Login failed' 
            }))
          )
        )
      )
    );
  });

  // localStorage Effect - speichert Token nach erfolgreichem Login
  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(({ token, user }) => {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
      })
    ),
    { dispatch: false }
  );

  // Logout Effect - löscht localStorage
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      })
    ),
    { dispatch: false }
  );
}