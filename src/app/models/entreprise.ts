// src/app/models/entreprise.ts

export class EntrepriseModel {
  id!: string;
  nom_entreprise!: string;
  nom_directeur!: string;
  prenom_directeur!: string;
  telephone_entreprise!: string;
  email_entreprise!: string;
  matricule_entreprise!: string;
  role!: string;
  created_at!: string;
  updated_at!: string;

  employes?: Employe[];
  produits?: Produit[];
}

/* 🔹 Employé */
export class Employe {
  id!: string;
  id_entreprise!: string;
  nom_employe!: string;
  prenom_employe!: string;
  adresse_employe!: string;
  telephone!: string;
  email_employe!: string;
  matricule_employe!: string;
  poste!: string;
  departement!: string;
  date_embauche!: string;
  salaire!: string;
  role!: string;
  created_at!: string;
  updated_at!: string;
}

/* 🔹 Produit */
export class Produit {
  id!: string;
  nom!: string;
  description!: string;
  image!: string | null;
  id_entreprise!: string;
  created_at!: string;
  updated_at!: string;
}

/* 🔹 Réponses API */

export interface EntreprisesResponse {
  success: boolean;
  message: string;
  data: EntrepriseModel[];
}

export interface EntrepriseResponse {
  success: boolean;
  message: string;
  data: EntrepriseModel;
}

export interface ActionResponse {
  success: boolean;
  message: string;
}