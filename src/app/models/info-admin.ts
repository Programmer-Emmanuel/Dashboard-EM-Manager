export class InfoAdmin {
  id!: string;
  nom!: string;
  email!: string;
  telephone!: string;
  image!: string | null;
  role!: number;
  solde!: number;
  created_at!: string | Date;
  updated_at!: string | Date;

  // 🔥 Méthode pour transformer le rôle
  get roleLabel(): string {
    return this.role === 1 ? 'Super Admin' : 'Sous Admin';
  }
}

export interface InfoAdminResponse {
  success: boolean;
  message: string;
  data: InfoAdmin;
}