// src/app/models/administrateur.ts

export class Administrateur {
  id!: string;
  nom!: string;
  email!: string;
  telephone!: string;
  image?: string;
  role!: number;
  roleLabel?: string;
  created_at!: string;
  updated_at!: string;
}

export interface AdministrateurResponse {
  success: boolean;
  message: string;
  data: Administrateur;
}

export interface AdministrateursResponse {
  success: boolean;
  message: string;
  data: Administrateur[];
}

export interface ActionResponse {
  success: boolean;
  message: string;
}