import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

// Services
import { User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule
  ],
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss']
})
export class UserTableComponent {
  @Input() users: User[] = [];
  @Input() showActions: boolean = true;
  @Input() currentUserId: number | null = null;

  @Output() edit = new EventEmitter<User>();
  @Output() delete = new EventEmitter<User>();

  onEdit(user: User): void {
    this.edit.emit(user);
  }

  onDelete(user: User): void {
    this.delete.emit(user);
  }
}