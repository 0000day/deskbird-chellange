import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';

// Components
import { UserListComponent } from '../users/user-list.component';

// NgRx
import * as AuthActions from '../../store/auth/auth.actions';
import { AuthState } from '../../store/auth/auth.state';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TabViewModule,
    UserListComponent
  ],
  template: `
    <div class="dashboard-container">
      
      <!-- Header -->
      <div class="dashboard-header">
        <h1>Deskbird Dashboard</h1>
        <div class="user-info" *ngIf="user$ | async as user">
          <span>Willkommen, {{ user.firstName }} {{ user.lastName }}</span>
          <span class="role-badge" [class]="'role-' + user.role.toLowerCase()">
            {{ user.role }}
          </span>
          <p-button 
            label="Logout" 
            icon="pi pi-sign-out"
            severity="secondary"
            size="small"
            (onClick)="logout()">
          </p-button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="dashboard-content">
        
        <!-- Admin Content -->
        <div *ngIf="isAdmin$ | async">
          <p-tabView>
            <p-tabPanel header="Benutzer verwalten" leftIcon="pi pi-users">
              <app-user-list></app-user-list>
            </p-tabPanel>
            <p-tabPanel header="Statistiken" leftIcon="pi pi-chart-bar">
              <p-card header="Dashboard Statistiken">
                <p>Hier könnten weitere Admin-Features stehen...</p>
              </p-card>
            </p-tabPanel>
          </p-tabView>
        </div>

        <!-- User Content -->
        <div *ngIf="!(isAdmin$ | async)">
          <p-card header="Ihr Dashboard">
            <p>Willkommen im User-Dashboard!</p>
            <p>Hier könnten User-spezifische Features stehen...</p>
          </p-card>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      padding: 2rem;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1.5rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .role-badge {
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
  `]
})
export class DashboardComponent implements OnInit {
  user$: Observable<any>;
  isAdmin$: Observable<boolean>;

  constructor(private store: Store<{ auth: AuthState }>) {
    this.user$ = this.store.select(state => state.auth.user);
    this.isAdmin$ = this.store.select(state => state.auth.user?.role === 'ADMIN');
  }

  ngOnInit(): void {
    // Component initialization
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}