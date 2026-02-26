import { Component, OnInit, HostListener, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin-service';
import { ActionResponse, Administrateur, AdministrateurResponse, AdministrateursResponse } from '../../../models/administrateur';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export default class Admin implements OnInit {
  // Données principales
  admins: Administrateur[] = [];
  filteredAdmins: Administrateur[] = [];
  selectedAdmin: Administrateur | null = null;
  searchTerm: string = '';
  
  // États de chargement
  isLoading = true;
  isDetailsLoading = false;
  isSubmitting = false;
  error: string | null = null;
  successMessage: string | null = null;

  // États des modales
  showAddModal = false;
  showDetailsModal = false;
  showDeleteModal = false;
  
  // Formulaire d'ajout
  addFormData = {
    nom: '',
    email: '',
    telephone: ''
  };

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadAdmins();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapePress(event: Event) {
    this.closeAllModals();
  }

  // Chargement des admins
  loadAdmins(): void {
    this.isLoading = true;
    this.error = null;
    
    this.adminService.getAdmins().subscribe({
      next: (response: AdministrateursResponse) => {
        if (response.success) {
          this.admins = response.data.map(admin => ({
            ...admin,
            roleLabel: this.getRoleLabel(admin.role)
          }));
          this.filteredAdmins = [...this.admins];
          this.totalItems = this.admins.length;
          console.log('Admins chargés:', this.admins);
        } else {
          this.error = response.message || 'Erreur lors du chargement';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur API:', err);
        this.error = err.error?.message || 'Erreur de connexion au serveur';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Obtenir le libellé du rôle
  getRoleLabel(role: number): string {
    return role === 1 ? 'Super Admin' : 'Sous Admin';
  }

  // Filtrage des admins
  filterAdmins(): void {
    if (!this.searchTerm.trim()) {
      this.filteredAdmins = [...this.admins];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredAdmins = this.admins.filter(admin => 
        admin.nom.toLowerCase().includes(term) ||
        admin.email.toLowerCase().includes(term) ||
        admin.telephone.includes(term)
      );
    }
    this.totalItems = this.filteredAdmins.length;
    this.currentPage = 1;
  }

  // Pagination
  get paginatedAdmins(): Administrateur[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredAdmins.slice(start, end);
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  // Modale d'ajout
  openAddModal(): void {
    this.addFormData = {
      nom: '',
      email: '',
      telephone: ''
    };
    this.error = null;
    this.showAddModal = true;
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges();
  }

  closeAddModal(): void {
    this.showAddModal = false;
    document.body.style.overflow = 'unset';
    this.cdr.detectChanges();
  }

  onSubmitAdd(): void {
    // Validation
    if (!this.addFormData.nom || !this.addFormData.email || !this.addFormData.telephone) {
      this.error = 'Tous les champs sont requis';
      this.cdr.detectChanges();
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.addFormData.email)) {
      this.error = 'Format d\'email invalide';
      this.cdr.detectChanges();
      return;
    }

    // Validation téléphone (10 chiffres)
    if (!/^\d{10}$/.test(this.addFormData.telephone)) {
      this.error = 'Le téléphone doit contenir 10 chiffres';
      this.cdr.detectChanges();
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    this.adminService.addAdmin(this.addFormData).subscribe({
      next: (response: AdministrateurResponse) => {
        if (response.success) {
          this.successMessage = response.message || 'Admin ajouté avec succès';
          this.loadAdmins(); // Recharger la liste
          this.closeAddModal();
          
          this.ngZone.run(() => {
            setTimeout(() => {
              this.successMessage = null;
              this.cdr.detectChanges();
            }, 3000);
          });
        } else {
          this.error = response.message || 'Erreur lors de l\'ajout';
        }
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur ajout:', err);
        this.error = err.error?.message || 'Erreur de connexion au serveur';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Modale de détails
  openDetailsModal(id: string): void {
    this.isDetailsLoading = true;
    this.selectedAdmin = null;
    this.showDetailsModal = true;
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges();

    this.adminService.getAdmin(id).subscribe({
      next: (response: AdministrateurResponse) => {
        if (response.success) {
          this.selectedAdmin = {
            ...response.data,
            roleLabel: this.getRoleLabel(response.data.role)
          };
          console.log('Détails admin:', this.selectedAdmin);
        } else {
          this.error = response.message || 'Erreur lors du chargement des détails';
        }
        this.isDetailsLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement détails:', err);
        this.error = err.error?.message || 'Erreur de connexion au serveur';
        this.isDetailsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedAdmin = null;
    document.body.style.overflow = 'unset';
    this.cdr.detectChanges();
  }

  // Modale de suppression
  openDeleteModal(admin: Administrateur): void {
    this.selectedAdmin = admin;
    this.showDeleteModal = true;
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges();
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedAdmin = null;
    document.body.style.overflow = 'unset';
    this.cdr.detectChanges();
  }

  onDeleteConfirm(): void {
    if (!this.selectedAdmin) return;

    this.isSubmitting = true;
    this.error = null;

    this.adminService.deleteAdmin(this.selectedAdmin.id).subscribe({
      next: (response: ActionResponse) => {
        if (response.success) {
          this.successMessage = response.message || 'Admin supprimé avec succès';
          this.loadAdmins(); // Recharger la liste
          this.closeDeleteModal();
          
          this.ngZone.run(() => {
            setTimeout(() => {
              this.successMessage = null;
              this.cdr.detectChanges();
            }, 3000);
          });
        } else {
          this.error = response.message || 'Erreur lors de la suppression';
        }
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getInitials(nom: string): string {
    if (!nom) return 'AD';
    return nom
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  closeAllModals(): void {
    this.closeAddModal();
    this.closeDetailsModal();
    this.closeDeleteModal();
  }

  clearMessages(): void {
    this.error = null;
    this.successMessage = null;
  }
}