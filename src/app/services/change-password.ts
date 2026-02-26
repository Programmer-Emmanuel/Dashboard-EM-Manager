// src/app/services/change-password.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChangePassword, ChangePasswordResponse } from '../models/change-password';
import { environment } from '../api/api';

@Injectable({
  providedIn: 'root',
})
export class ChangePasswordService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  changePassword(data: ChangePassword): Observable<ChangePasswordResponse> {
    const token = localStorage.getItem('auth_token') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post<ChangePasswordResponse>(
      `${this.apiUrl}/change/password`,
      data,
      { headers }
    );
  }
}