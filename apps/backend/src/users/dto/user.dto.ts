export class UserResponseDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: 'ADMIN' | 'USER';
}

export class UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'ADMIN' | 'USER';
  isActive?: boolean;
}