import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthModel } from '../models/auth-model';
import { environment } from '../api/api';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  login(credentials: AuthModel): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

    logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }
}