import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastModule } from 'primeng/toast';
import * as AuthActions from './store/auth/auth.actions';
import { AuthState } from './store/auth/auth.state';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'frontend';

  constructor(private store: Store<{ auth: AuthState }>) {}

  ngOnInit(): void {
    // Beim App-Start prüfen, ob User im localStorage ist
    this.store.dispatch(AuthActions.loadUserFromStorage());
  }
}
