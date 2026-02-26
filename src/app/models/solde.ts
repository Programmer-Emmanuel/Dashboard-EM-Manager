export class Solde {
  montant!: number;
}

export interface SoldeResponse {
  success: boolean;
  data: number;
  message: string;
}