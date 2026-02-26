import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SoldeResponse } from '../models/solde';
import { environment } from '../api/api';

@Injectable({
  providedIn: 'root',
})
export class SoldeService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // 🔹 Solde total des entreprises
  getSoldeEntreprises(): Observable<SoldeResponse> {
    return this.http.get<SoldeResponse>(
      `${this.apiUrl}/solde/entreprise`,
      { headers: this.getHeaders() }
    );
  }

  // 🔹 Solde du super admin
  getSoldeAdmin(): Observable<SoldeResponse> {
    return this.http.get<SoldeResponse>(
      `${this.apiUrl}/solde/admin`,
      { headers: this.getHeaders() }
    );
  }
}