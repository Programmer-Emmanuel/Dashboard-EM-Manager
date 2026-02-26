import { ChangeDetectorRef, Component } from '@angular/core';
import { Nav } from '../../components/nav/nav';
import Footer from '../../components/footer/footer';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthModel } from '../../models/auth-model';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [Nav, Footer, FormsModule, CommonModule],
  templateUrl: './connexion.html',
  styleUrl: './connexion.css',
})
export default class Connexion {
  credentials: AuthModel = new AuthModel();
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';
    
    // Validation basique
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    if (!this.isValidEmail(this.credentials.email)) {
      this.errorMessage = 'Veuillez entrer une adresse email valide';
      return;
    }

    this.isLoading = true;

    // Appel API réel
    this.authService.login(this.credentials).subscribe({
      next: (response: any) => {
        console.log('Connexion réussie', response);
        
        // Stocker le token et les données utilisateur
        if (response.data?.token) {
          this.authService.setToken(response.data.token);
          this.authService.setUser(response.data);
        }
        
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur de connexion', error);
        
        // Gestion des erreurs selon le code HTTP
        if (error.status === 422) {
          this.errorMessage = error.error?.message || 'Données invalides';
        } else if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Identifiants incorrects';
        } else if (error.status === 500) {
          this.errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else {
          this.errorMessage = 'Erreur de connexion. Vérifiez votre réseau.';
        }
        
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}