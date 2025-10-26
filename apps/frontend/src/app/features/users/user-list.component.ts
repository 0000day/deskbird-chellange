import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';

// Services
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    DialogModule,
    DropdownModule
  ],
  template: `
    <div class="user-list-container">
      
      <!-- Table Header -->
      <div class="table-header">
        <h2>Benutzer verwalten</h2>
        <div class="header-actions">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input 
              pInputText 
              type="text" 
              [(ngModel)]="searchTerm"
              placeholder="Suchen..." 
              (input)="filterUsers()" />
          </span>
          <p-button 
            label="Benutzer hinzufügen"
            icon="pi pi-plus"
            (onClick)="showAddUserDialog()">
          </p-button>
        </div>
      </div>

      <!-- Users Table -->
      <p-table 
        [value]="filteredUsers" 
        [paginator]="true" 
        [rows]="10"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Zeige {first} bis {last} von {totalRecords} Benutzern"
        styleClass="p-datatable-gridlines"
        responsiveLayout="scroll">
        
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="id">ID <p-sortIcon field="id"></p-sortIcon></th>
            <th pSortableColumn="firstName">Name <p-sortIcon field="firstName"></p-sortIcon></th>
            <th pSortableColumn="email">E-Mail <p-sortIcon field="email"></p-sortIcon></th>
            <th pSortableColumn="role">Rolle <p-sortIcon field="role"></p-sortIcon></th>
            <th pSortableColumn="isActive">Status <p-sortIcon field="isActive"></p-sortIcon></th>
            <th>Aktionen</th>
          </tr>
        </ng-template>
        
        <ng-template pTemplate="body" let-user>
          <tr>
            <td>{{ user.id }}</td>
            <td>{{ user.firstName }} {{ user.lastName }}</td>
            <td>{{ user.email }}</td>
            <td>
              <p-tag 
                [value]="user.role" 
                [severity]="user.role === 'ADMIN' ? 'danger' : 'info'">
              </p-tag>
            </td>
            <td>
              <p-tag 
                [value]="user.isActive ? 'Aktiv' : 'Inaktiv'" 
                [severity]="user.isActive ? 'success' : 'warning'">
              </p-tag>
            </td>
            <td>
              <div class="action-buttons">
                <p-button 
                  icon="pi pi-pencil"
                  severity="info"
                  size="small"
                  [text]="true"
                  pTooltip="Bearbeiten"
                  (onClick)="editUser(user)">
                </p-button>
                <p-button 
                  icon="pi pi-trash"
                  severity="danger"
                  size="small"
                  [text]="true"
                  pTooltip="Löschen"
                  (onClick)="deleteUser(user)">
                </p-button>
              </div>
            </td>
          </tr>
        </ng-template>
        
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" style="text-align: center;">
              Keine Benutzer gefunden.
            </td>
          </tr>
        </ng-template>
      </p-table>

    </div>
  `,
  styles: [`
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    @media (max-width: 768px) {
      .table-header {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .header-actions {
        width: 100%;
        justify-content: space-between;
      }
    }
  `]
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.authService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...users];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
      }
    });
  }

  filterUsers(): void {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.users];
      return;
    }

    this.filteredUsers = this.users.filter(user =>
      user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  editUser(user: User): void {
    console.log('Edit user:', user);
    // TODO: Implement edit functionality
  }

  deleteUser(user: User): void {
    console.log('Delete user:', user);
    // TODO: Implement delete functionality
  }

  showAddUserDialog(): void {
    console.log('Add new user');
    // TODO: Implement add user functionality
  }
}