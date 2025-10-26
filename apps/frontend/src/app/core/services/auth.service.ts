import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:3000';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = API_URL;

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  updateUser(id: number, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, userData);
  }

  createUser(userData: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, userData);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }
}