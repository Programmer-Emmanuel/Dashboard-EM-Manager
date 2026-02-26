// src/app/services/entreprise.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  EntrepriseModel,
  EntreprisesResponse,
  EntrepriseResponse,
  ActionResponse
} from '../models/entreprise';
import { environment } from '../api/api';

@Injectable({
  providedIn: 'root',
})
export class EntrepriseService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  /* 🔹 Liste des entreprises */
  getEntreprises(): Observable<EntreprisesResponse> {
    return this.http.get<EntreprisesResponse>(
      `${this.apiUrl}/entreprises`,
      { headers: this.getHeaders() }
    );
  }

  /* 🔹 Détail d'une entreprise */
  getEntreprise(id: string): Observable<EntrepriseResponse> {
    return this.http.get<EntrepriseResponse>(
      `${this.apiUrl}/entreprise/${id}`,
      { headers: this.getHeaders() }
    );
  }

  /* 🔹 Supprimer une entreprise */
  deleteEntreprise(id: string): Observable<ActionResponse> {
    return this.http.post<ActionResponse>(
      `${this.apiUrl}/delete/entreprise/${id}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  /* 🔹 Réinitialiser mot de passe */
  resetPassword(id: string, adminPassword: string): Observable<ActionResponse> {
    return this.http.post<ActionResponse>(
      `${this.apiUrl}/reset/password/${id}`,
      { password: adminPassword },
      { headers: this.getHeaders() }
    );
  }
}