export class ChangePassword {
    ancien!: string;
    nouveau!: string;
    nouveau_confirmation!: string;
}
export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
  erreur?: string;
}