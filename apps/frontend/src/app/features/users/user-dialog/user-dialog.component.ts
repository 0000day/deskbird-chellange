import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';

// Services
import { User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule
  ],
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss']
})
export class UserDialogComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() user: User | null = null;
  @Input() loading: boolean = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  userForm: FormGroup;

  roleOptions = [
    { label: 'Admin', value: 'ADMIN' },
    { label: 'User', value: 'USER' }
  ];

  statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['USER', Validators.required],
      isActive: [true, Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.setupForm();
    }
  }

  private setupForm(): void {
    if (this.isEditMode && this.user) {
      // Edit mode - disable password validation and prefill form
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
      
      // Disable email field in edit mode
      this.userForm.get('email')?.disable();
      
      this.userForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        role: this.user.role,
        isActive: this.user.isActive
      });
    } else {
      // Add mode - enable password validation and reset form
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
      
      // Enable email field in add mode
      this.userForm.get('email')?.enable();
      
      this.userForm.reset({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'USER',
        isActive: true
      });
    }
  }

  onSave(): void {
    if (this.userForm.invalid) {
      return;
    }

    // Use getRawValue() to include disabled fields in the form value
    const formValue = this.userForm.getRawValue();
    
    // In edit mode, remove email from the data being sent
    if (this.isEditMode) {
      const { email, ...updateData } = formValue;
      this.save.emit(updateData);
    } else {
      this.save.emit(formValue);
    }
  }

  onCancel(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancel.emit();
  }

  onDialogHide(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}