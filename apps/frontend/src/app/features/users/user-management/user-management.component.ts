import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';

// PrimeNG Services
import { ConfirmationService } from 'primeng/api';

// Services
import { AuthService, User } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

// Store
import { AuthState } from '../../../store/auth/auth.state';

// Components
import { UserDialogComponent } from '../user-dialog/user-dialog.component';
import { UserTableComponent } from '../user-table/user-table.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    UserDialogComponent,
    UserTableComponent
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  @Input() isAdmin: boolean = true;
  
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  loading: boolean = false;
  currentUserId: number | null = null;

  // User Dialog (Edit & Add)
  userDialogVisible: boolean = false;
  selectedUser: User | null = null;
  isEditMode: boolean = false;

  constructor(
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private store: Store<{ auth: AuthState }>
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    
    // Get current user ID from store
    this.store.select('auth').subscribe(authState => {
      this.currentUserId = authState.user?.id || null;
    });
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
    this.selectedUser = user;
    this.isEditMode = true;
    this.userDialogVisible = true;
  }

  showAddUserDialog(): void {
    this.selectedUser = null;
    this.isEditMode = false;
    this.userDialogVisible = true;
  }

  onUserSave(userData: any): void {
    this.loading = true;
    
    if (this.isEditMode && this.selectedUser) {
      // Update existing user
      const updateData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        isActive: userData.isActive
      };
      
      this.authService.updateUser(this.selectedUser.id, updateData).subscribe({
        next: (updatedUser) => {
          // Update user in local array
          const index = this.users.findIndex(u => u.id === this.selectedUser?.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
            this.filterUsers(); // Refresh filtered list
          }
          this.userDialogVisible = false;
          this.loading = false;
          this.toastService.showSuccess('User updated successfully');
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.loading = false;
          const errorMessage = error.error?.message || 'Failed to update user';
          this.toastService.showError(errorMessage);
        }
      });
    } else {
      // Create new user
      this.authService.createUser(userData).subscribe({
        next: (newUser) => {
          // Add user to local array
          this.users.unshift(newUser);
          this.filterUsers(); // Refresh filtered list
          this.userDialogVisible = false;
          this.loading = false;
          this.toastService.showSuccess('User created successfully');
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.loading = false;
          const errorMessage = error.error?.message || 'Failed to create user';
          this.toastService.showError(errorMessage);
        }
      });
    }
  }

  onUserCancel(): void {
    this.userDialogVisible = false;
  }

  deleteUser(user: User): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete user "${user.firstName} ${user.lastName}"?`,
      header: 'Delete User',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.loading = true;
        this.authService.deleteUser(user.id).subscribe({
          next: () => {
            // Remove user from local array
            this.users = this.users.filter(u => u.id !== user.id);
            this.filterUsers(); // Refresh filtered list
            this.loading = false;
            this.toastService.showSuccess('User deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.loading = false;
            const errorMessage = error.error?.message || 'Failed to delete user';
            this.toastService.showError(errorMessage);
          }
        });
      }
    });
  }
}