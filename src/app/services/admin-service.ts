// src/app/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InfoAdmin, InfoAdminResponse } from '../models/info-admin';
import { Administrateur, AdministrateurResponse, AdministrateursResponse, ActionResponse } from '../models/administrateur';
import { environment } from '../api/api';


@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // Récupérer les infos de l'admin connecté
  getInfoAdmin(): Observable<InfoAdminResponse> {
    return this.http.get<InfoAdminResponse>(
      `${this.apiUrl}/info/admin`,
      { headers: this.getHeaders() }
    );
  }

  // Mettre à jour le profil admin
  updateProfilAdmin(adminData: {
    nom?: string;
    email?: string;
    telephone?: string;
    image?: File | null;
  }): Observable<InfoAdminResponse> {
    const formData = new FormData();
    if (adminData.nom) formData.append('nom', adminData.nom);
    if (adminData.email) formData.append('email', adminData.email);
    if (adminData.telephone) formData.append('telephone', adminData.telephone);
    if (adminData.image) formData.append('image', adminData.image);

    return this.http.post<InfoAdminResponse>(
      `${this.apiUrl}/update/profil/admin`,
      formData,
      { headers: this.getHeaders() }
    );
  }

  // 🔹 Récupérer la liste des sous-admins
  getAdmins(): Observable<AdministrateursResponse> {
    return this.http.get<AdministrateursResponse>(
      `${this.apiUrl}/admins`,
      { headers: this.getHeaders() }
    );
  }

  // 🔹 Récupérer les détails d'un admin
  getAdmin(id: string): Observable<AdministrateurResponse> {
    return this.http.get<AdministrateurResponse>(
      `${this.apiUrl}/admin/${id}`,
      { headers: this.getHeaders() }
    );
  }

  // 🔹 Ajouter un sous-admin
  addAdmin(adminData: {
    nom: string;
    email: string;
    telephone: string;
  }): Observable<AdministrateurResponse> {
    return this.http.post<AdministrateurResponse>(
      `${this.apiUrl}/ajout/admin`,
      adminData,
      { headers: this.getHeaders() }
    );
  }

  // 🔹 Supprimer un sous-admin
  deleteAdmin(id: string): Observable<ActionResponse> {
    return this.http.post<ActionResponse>(
      `${this.apiUrl}/delete/admin/${id}`,
      {},
      { headers: this.getHeaders() }
    );
  }
}