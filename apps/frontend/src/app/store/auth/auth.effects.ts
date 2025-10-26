import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

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
        // Weiterleitung zum Dashboard
        this.router.navigate(['/dashboard']);
      })
    ),
    { dispatch: false }
  );

  // Logout Effect - löscht localStorage und leitet zur Login-Seite weiter
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        // Weiterleitung zum Login
        this.router.navigate(['/login']);
      })
    ),
    { dispatch: false }
  );
}