import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';

// Components
import { SecurityInsightsComponent } from '../../security/security-insights/security-insights.component';
import { UserManagementComponent } from '../../users/user-management/user-management.component';

// NgRx
import * as AuthActions from '../../../store/auth/auth.actions';
import { AuthState } from '../../../store/auth/auth.state';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TabViewModule,
    UserManagementComponent,
    SecurityInsightsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  user$: Observable<any>;
  isAdmin$: Observable<boolean>;

  constructor(private store: Store<{ auth: AuthState }>) {
    this.user$ = this.store.select(state => state.auth.user);
    this.isAdmin$ = this.store.select(state => state.auth.user?.role === 'ADMIN');
  }

  ngOnInit(): void { }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}