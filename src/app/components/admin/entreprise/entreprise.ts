// src/app/pages/entreprise/entreprise.component.ts

import { Component, OnInit, HostListener, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntrepriseService } from '../../../services/entreprise-service';
import { 
  EntrepriseModel, 
  EntreprisesResponse, 
  EntrepriseResponse, 
  ActionResponse,
  Employe,
  Produit 
} from '../../../models/entreprise';

@Component({
  selector: 'app-entreprise',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './entreprise.html',
  styleUrl: './entreprise.css'
}) 
export default class EntrepriseComponent implements OnInit {
  // Données principales
  entreprises: EntrepriseModel[] = [];
  filteredEntreprises: EntrepriseModel[] = [];
  selectedEntreprise: EntrepriseModel | null = null;
  searchTerm: string = '';
  
  // États de chargement
  isLoading = true;
  isDetailsLoading = false;
  isSubmitting = false;
  error: string | null = null;
  successMessage: string | null = null;

  // États des modales
  showDetailsModal = false;
  showSearchUserModal = false;
  showResetPasswordModal = false;
  showDeleteModal = false;
  showToggleModal = false;
  
  // Données pour les modales
  searchResults: Array<{ type: 'entreprise' | 'employe'; data: any }> = [];
  searchUserError: string | null = null;
  
  // Formulaire de recherche
  searchMatricule: string = '';
  showSuggestions: boolean = false;
  
  // Formulaire de réinitialisation
  resetPasswordData = {
    adminPassword: '',
    userId: '',
    userType: '',
    userName: ''
  };

  // Formulaire pour activer/désactiver
  toggleData = {
    adminPassword: '',
    entrepriseId: '',
    entrepriseName: '',
    currentStatus: false,
    action: '' // 'activer' ou 'désactiver'
  };

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Cache pour les employés de toutes les entreprises
  allEmployes: Employe[] = [];

  constructor(
    private entrepriseService: EntrepriseService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadEntreprises();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapePress(event: Event) {
    this.closeAllModals();
    this.showSuggestions = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-container')) {
      this.showSuggestions = false;
    }
  }

  // Chargement des entreprises
  loadEntreprises(): void {
    this.isLoading = true;
    this.error = null;
    
    this.entrepriseService.getEntreprises().subscribe({
      next: (response: EntreprisesResponse) => {
        if (response.success) {
          this.entreprises = response.data;
          this.filteredEntreprises = [...this.entreprises];
          this.totalItems = this.entreprises.length;
          console.log('Entreprises chargées:', this.entreprises);
          
          // Charger les employés de toutes les entreprises
          this.loadAllEmployes();
        } else {
          this.error = response.message || 'Erreur lors du chargement';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur API:', err);
        this.error = 'Erreur de connexion au serveur';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Charger tous les employés de toutes les entreprises
  loadAllEmployes(): void {
    this.allEmployes = [];
    let completedRequests = 0;
    
    this.entreprises.forEach(entreprise => {
      this.entrepriseService.getEntreprise(entreprise.id).subscribe({
        next: (response: EntrepriseResponse) => {
          if (response.success && response.data.employes) {
            this.allEmployes = [...this.allEmployes, ...response.data.employes];
          }
          completedRequests++;
          if (completedRequests === this.entreprises.length) {
            console.log('Tous les employés chargés:', this.allEmployes.length);
          }
        },
        error: (err) => {
          console.error(`Erreur chargement employés pour ${entreprise.id}:`, err);
          completedRequests++;
        }
      });
    });
  }

  // Filtrage des entreprises
  filterEntreprises(): void {
    if (!this.searchTerm.trim()) {
      this.filteredEntreprises = [...this.entreprises];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredEntreprises = this.entreprises.filter(emp => 
        emp.nom_entreprise.toLowerCase().includes(term) ||
        emp.matricule_entreprise.toLowerCase().includes(term) ||
        emp.email_entreprise.toLowerCase().includes(term) ||
        `${emp.prenom_directeur} ${emp.nom_directeur}`.toLowerCase().includes(term)
      );
    }
    this.totalItems = this.filteredEntreprises.length;
    this.currentPage = 1;
  }

  // Pagination
  get paginatedEntreprises(): EntrepriseModel[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredEntreprises.slice(start, end);
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  // Modale de détails
  openDetailsModal(id: string): void {
    this.isDetailsLoading = true;
    this.selectedEntreprise = null;
    this.showDetailsModal = true;
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges();

    this.entrepriseService.getEntreprise(id).subscribe({
      next: (response: EntrepriseResponse) => {
        if (response.success) {
          this.selectedEntreprise = response.data;
          console.log('Détails entreprise:', this.selectedEntreprise);
        } else {
          this.error = response.message || 'Erreur lors du chargement des détails';
        }
        this.isDetailsLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement détails:', err);
        this.error = 'Erreur de connexion au serveur';
        this.isDetailsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedEntreprise = null;
    document.body.style.overflow = 'unset';
    this.cdr.detectChanges();
  }

  // Modale de recherche d'utilisateur avec suggestions
  openSearchUserModal(): void {
    this.searchMatricule = '';
    this.searchResults = [];
    this.searchUserError = null;
    this.showSuggestions = false;
    this.showSearchUserModal = true;
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges();
  }

  onSearchInput(): void {
    if (this.searchMatricule.length >= 2) {
      this.searchUsers();
    } else {
      this.searchResults = [];
      this.showSuggestions = false;
    }
  }

  searchUsers(): void {
    const term = this.searchMatricule.toLowerCase().trim();
    if (term.length < 2) return;

    this.searchResults = [];
    
    // Recherche dans les entreprises
    const entreprisesTrouvees = this.entreprises.filter(e => 
      e.matricule_entreprise.toLowerCase().includes(term) ||
      e.nom_entreprise.toLowerCase().includes(term) ||
      e.email_entreprise.toLowerCase().includes(term)
    ).map(e => ({ type: 'entreprise' as const, data: e }));

    // Recherche dans les employés
    const employesTrouves = this.allEmployes.filter(emp => 
      emp.matricule_employe.toLowerCase().includes(term) ||
      emp.nom_employe.toLowerCase().includes(term) ||
      emp.prenom_employe.toLowerCase().includes(term) ||
      emp.email_employe.toLowerCase().includes(term)
    ).map(emp => ({ type: 'employe' as const, data: emp }));

    this.searchResults = [...entreprisesTrouvees, ...employesTrouves];
    this.showSuggestions = this.searchResults.length > 0;
    this.cdr.detectChanges();
  }

  selectUser(result: { type: 'entreprise' | 'employe'; data: any }): void {
    this.searchMatricule = result.type === 'entreprise' 
      ? result.data.matricule_entreprise 
      : result.data.matricule_employe;
    this.searchResults = [result];
    this.showSuggestions = false;
  }

  searchUser(): void {
    if (!this.searchMatricule.trim()) {
      this.searchUserError = 'Veuillez entrer un matricule';
      this.cdr.detectChanges();
      return;
    }

    this.isSubmitting = true;
    this.searchUserError = null;

    // Recherche exacte par matricule
    const entreprise = this.entreprises.find(e => 
      e.matricule_entreprise.toLowerCase() === this.searchMatricule.toLowerCase()
    );

    if (entreprise) {
      this.searchResults = [{
        type: 'entreprise',
        data: entreprise
      }];
      this.isSubmitting = false;
      this.cdr.detectChanges();
      return;
    }

    // Recherche dans les employés
    const employe = this.allEmployes.find(emp => 
      emp.matricule_employe.toLowerCase() === this.searchMatricule.toLowerCase()
    );

    if (employe) {
      this.searchResults = [{
        type: 'employe',
        data: employe
      }];
      this.isSubmitting = false;
      this.cdr.detectChanges();
      return;
    }

    this.searchUserError = 'Utilisateur non trouvé. Vérifiez le matricule.';
    this.isSubmitting = false;
    this.cdr.detectChanges();
  }

  selectUserForReset(result: { type: string; data: any }): void {
    this.closeSearchUserModal();
    this.openResetPasswordModal(result.type, result.data);
  }

  closeSearchUserModal(): void {
    this.showSearchUserModal = false;
    this.searchMatricule = '';
    this.searchResults = [];
    this.searchUserError = null;
    this.showSuggestions = false;
    this.isSubmitting = false;
    document.body.style.overflow = 'unset';
    this.cdr.detectChanges();
  }

  // Modale d'activation/désactivation
  openToggleModal(entreprise: EntrepriseModel): void {
    this.toggleData = {
      adminPassword: '',
      entrepriseId: entreprise.id,
      entrepriseName: entreprise.nom_entreprise,
      currentStatus: entreprise.is_active,
      action: entreprise.is_active ? 'désactiver' : 'activer'
    };
    this.showToggleModal = true;
    document.body.style.overflow = 'hidden';
    this.error = null;
    this.successMessage = null;
    this.cdr.detectChanges();
  }

  closeToggleModal(): void {
    this.showToggleModal = false;
    this.toggleData = {
      adminPassword: '',
      entrepriseId: '',
      entrepriseName: '',
      currentStatus: false,
      action: ''
    };
    document.body.style.overflow = 'unset';
    this.error = null;
    this.cdr.detectChanges();
  }

  onSubmitToggle(): void {
    if (!this.toggleData.adminPassword) {
      this.error = 'Veuillez entrer votre mot de passe administrateur';
      this.cdr.detectChanges();
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    this.entrepriseService.toggleEntreprise(
      this.toggleData.entrepriseId,
      this.toggleData.adminPassword
    ).subscribe({
      next: (response: ActionResponse) => {
        if (response.success) {
          // Mettre à jour la liste des entreprises
          const index = this.entreprises.findIndex(e => e.id === this.toggleData.entrepriseId);
          if (index !== -1) {
            this.entreprises[index].is_active = !this.toggleData.currentStatus;
            // Mettre à jour aussi dans filteredEntreprises
            const filteredIndex = this.filteredEntreprises.findIndex(e => e.id === this.toggleData.entrepriseId);
            if (filteredIndex !== -1) {
              this.filteredEntreprises[filteredIndex].is_active = !this.toggleData.currentStatus;
            }
          }

          this.successMessage = response.message || `Entreprise ${this.toggleData.action} avec succès`;
          this.cdr.detectChanges();
          
          this.ngZone.run(() => {
            setTimeout(() => {
              this.closeToggleModal();
              this.successMessage = null;
              this.cdr.detectChanges();
            }, 3000);
          });
        } else {
          this.error = response.message || 'Erreur lors de l\'opération';
        }
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur toggle:', err);
        this.error = err.error?.message || 'Erreur de connexion au serveur';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Modale de réinitialisation de mot de passe
  openResetPasswordModal(type: string, data: any): void {
    this.resetPasswordData = {
      adminPassword: '',
      userId: data.id,
      userType: type,
      userName: type === 'entreprise' ? data.nom_entreprise : `${data.prenom_employe} ${data.nom_employe}`
    };
    this.showResetPasswordModal = true;
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges();
  }

  closeResetPasswordModal(): void {
    this.showResetPasswordModal = false;
    this.resetPasswordData = {
      adminPassword: '',
      userId: '',
      userType: '',
      userName: ''
    };
    document.body.style.overflow = 'unset';
    
    this.ngZone.run(() => {
      this.successMessage = null;
      this.cdr.detectChanges();
    });
  }

  onSubmitResetPassword(): void {
    if (!this.resetPasswordData.adminPassword) {
      this.error = 'Veuillez entrer votre mot de passe';
      this.cdr.detectChanges();
      return;
    }

    this.isSubmitting = true;
    this.error = null;
    this.successMessage = null;

    this.entrepriseService.resetPassword(
      this.resetPasswordData.userId,
      this.resetPasswordData.adminPassword
    ).subscribe({
      next: (response: ActionResponse) => {
        if (response.success) {
          this.successMessage = response.message || 'Mot de passe réinitialisé avec succès';
          this.cdr.detectChanges();
          
          this.ngZone.run(() => {
            setTimeout(() => {
              this.closeResetPasswordModal();
              this.cdr.detectChanges();
            }, 3000);
          });
        } else {
          this.error = response.message || 'Erreur lors de la réinitialisation';
        }
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur réinitialisation:', err);
        this.error = err.error?.message || 'Erreur de connexion au serveur';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Modale de suppression
  openDeleteModal(entreprise: EntrepriseModel): void {
    this.selectedEntreprise = entreprise;
    this.showDeleteModal = true;
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges();
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedEntreprise = null;
    document.body.style.overflow = 'unset';
    this.cdr.detectChanges();
  }

  onDeleteConfirm(): void {
    if (!this.selectedEntreprise) return;

    this.isSubmitting = true;
    this.error = null;

    this.entrepriseService.deleteEntreprise(this.selectedEntreprise.id).subscribe({
      next: (response: ActionResponse) => {
        if (response.success) {
          this.loadEntreprises(); // Recharger la liste
          this.successMessage = response.message || 'Entreprise supprimée avec succès';
          
          this.ngZone.run(() => {
            setTimeout(() => {
              this.successMessage = null;
              this.cdr.detectChanges();
            }, 3000);
          });
        } else {
          this.error = response.message || 'Erreur lors de la suppression';
        }
        this.closeDeleteModal();
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur suppression:', err);
        this.error = err.error?.message || 'Erreur de connexion au serveur';
        this.closeDeleteModal();
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Utilitaires
  formatDate(date: string | Date | undefined): string {
    if (!date) return 'Non renseignée';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatFinAbonnement(date: string | null): string {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  closeAllModals(): void {
    this.closeDetailsModal();
    this.closeSearchUserModal();
    this.closeResetPasswordModal();
    this.closeDeleteModal();
    this.closeToggleModal();
  }

  clearMessages(): void {
    this.error = null;
    this.successMessage = null;
  }
}