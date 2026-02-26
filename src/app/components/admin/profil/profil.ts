import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InfoAdmin, InfoAdminResponse } from '../../../models/info-admin';
import { ChangePassword, ChangePasswordResponse } from '../../../models/change-password';
import { AdminService } from '../../../services/admin-service';
import { ChangePasswordService } from '../../../services/change-password';

@Component({
  selector: 'app-profil',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export default class Profil implements OnInit {
  admin: InfoAdmin | null = null;
  isLoading = true;
  error: string | null = null;

  // Propriétés pour la modale d'édition
  showEditModal = false;
  isSubmitting = false;
  editError: string | null = null;
  editFormData = {
    nom: '',
    email: '',
    telephone: ''
  };
  selectedFile: File | null = null;
  previewImage: string | null = null;

  // Propriétés pour la modale de changement de mot de passe
  showPasswordModal = false;
  isPasswordSubmitting = false;
  passwordError: string | null = null;
  passwordSuccess: string | null = null;
  passwordFormData = {
    ancien: '',
    nouveau: '',
    nouveau_confirmation: ''
  };

  constructor(
    private adminService: AdminService,
    private changePasswordService: ChangePasswordService,
    private cdr: ChangeDetectorRef // AJOUTER CE CI
  ) {}

  ngOnInit(): void {
    this.loadAdminInfo();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapePress(event: Event) {
    if (this.showEditModal) {
      this.closeEditModal();
    }
    if (this.showPasswordModal) {
      this.closePasswordModal();
    }
  }

  loadAdminInfo(): void {
    this.isLoading = true;
    this.error = null; 
    
    this.adminService.getInfoAdmin().subscribe({
      next: (response: InfoAdminResponse) => {
        if (response.success && response.data) {
          this.admin = response.data;
          console.log('Admin chargé:', this.admin);
        } else {
          this.error = 'Impossible de charger les informations';
        }
        this.isLoading = false;
        this.cdr.detectChanges(); // FORCER LA DÉTECTION
      },
      error: (err) => {
        console.error('Erreur API:', err);
        this.error = 'Erreur lors du chargement des informations';
        this.isLoading = false;
        this.cdr.detectChanges(); // FORCER LA DÉTECTION
      }
    });
  }

  getInitials(): string {
    if (!this.admin?.nom) return 'AD';
    return this.admin.nom
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

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

  // Méthodes pour la modale d'édition
  openEditModal(): void {
    if (this.admin) {
      this.editFormData = {
        nom: this.admin.nom || '',
        email: this.admin.email || '',
        telephone: this.admin.telephone || ''
      };
      this.selectedFile = null;
      this.previewImage = null;
      this.editError = null;
      this.showEditModal = true;
      document.body.style.overflow = 'hidden';
      this.cdr.detectChanges(); // FORCER LA DÉTECTION
    }
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editError = null;
    this.selectedFile = null;
    this.previewImage = null;
    document.body.style.overflow = 'unset';
    this.cdr.detectChanges(); // FORCER LA DÉTECTION
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Vérifier la taille (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.editError = 'L\'image ne doit pas dépasser 2MB';
        this.cdr.detectChanges(); // FORCER LA DÉTECTION
        return;
      }

      // Vérifier le type
      if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
        this.editError = 'Format d\'image non supporté. Utilisez JPG, JPEG ou PNG';
        this.cdr.detectChanges(); // FORCER LA DÉTECTION
        return;
      }

      this.selectedFile = file;

      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImage = e.target.result;
        this.cdr.detectChanges(); // FORCER LA DÉTECTION
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (!this.editFormData.nom || !this.editFormData.email) {
      this.editError = 'Le nom et l\'email sont requis';
      this.cdr.detectChanges(); // FORCER LA DÉTECTION
      return;
    }

    // Valider le téléphone si présent
    if (this.editFormData.telephone && !/^\d{10}$/.test(this.editFormData.telephone)) {
      this.editError = 'Le téléphone doit contenir 10 chiffres';
      this.cdr.detectChanges(); // FORCER LA DÉTECTION
      return;
    }

    this.isSubmitting = true;
    this.editError = null;
    this.cdr.detectChanges(); // FORCER LA DÉTECTION

    const formData = {
      nom: this.editFormData.nom,
      email: this.editFormData.email,
      telephone: this.editFormData.telephone || undefined,
      image: this.selectedFile
    };

    this.adminService.updateProfilAdmin(formData).subscribe({
      next: (response: InfoAdminResponse) => {
        if (response.success && response.data) {
          this.admin = response.data;
          this.closeEditModal();
          console.log('Profil mis à jour avec succès');
        } else {
          this.editError = response.message || 'Erreur lors de la mise à jour';
        }
        this.isSubmitting = false;
        this.cdr.detectChanges(); // FORCER LA DÉTECTION
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour:', err);
        this.editError = err.error?.message || 'Erreur lors de la mise à jour du profil';
        this.isSubmitting = false;
        this.cdr.detectChanges(); // FORCER LA DÉTECTION
      }
    });
  }

  // Méthodes pour la modale de changement de mot de passe
  openPasswordModal(): void {
    this.passwordFormData = {
      ancien: '',
      nouveau: '',
      nouveau_confirmation: ''
    };
    this.passwordError = null;
    this.passwordSuccess = null;
    this.showPasswordModal = true;
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges(); // FORCER LA DÉTECTION
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.passwordError = null;
    this.passwordSuccess = null;
    document.body.style.overflow = 'unset';
    this.cdr.detectChanges(); // FORCER LA DÉTECTION
  }

  isPasswordFormValid(): boolean {
    return !!(
      this.passwordFormData.ancien &&
      this.passwordFormData.nouveau &&
      this.passwordFormData.nouveau_confirmation &&
      this.passwordFormData.nouveau.length >= 6 &&
      this.passwordFormData.nouveau === this.passwordFormData.nouveau_confirmation
    );
  }

  onPasswordSubmit(): void {
    if (!this.isPasswordFormValid()) {
      this.passwordError = 'Veuillez remplir correctement tous les champs';
      this.cdr.detectChanges(); // FORCER LA DÉTECTION
      return;
    }

    this.isPasswordSubmitting = true;
    this.passwordError = null;
    this.passwordSuccess = null;
    this.cdr.detectChanges(); // FORCER LA DÉTECTION

    const data: ChangePassword = {
      ancien: this.passwordFormData.ancien,
      nouveau: this.passwordFormData.nouveau,
      nouveau_confirmation: this.passwordFormData.nouveau_confirmation
    };

    this.changePasswordService.changePassword(data).subscribe({
      next: (response: ChangePasswordResponse) => {
        if (response.success) {
          this.passwordSuccess = response.message || 'Mot de passe modifié avec succès';
          setTimeout(() => {
            this.closePasswordModal();
            this.cdr.detectChanges(); // FORCER LA DÉTECTION
          }, 2000);
        } else {
          this.passwordError = response.message || 'Erreur lors du changement de mot de passe';
        }
        this.isPasswordSubmitting = false;
        this.cdr.detectChanges(); // FORCER LA DÉTECTION
      },
      error: (err) => {
        console.error('Erreur lors du changement de mot de passe:', err);
        this.passwordError = err.error?.message || 'Erreur lors du changement de mot de passe';
        this.isPasswordSubmitting = false;
        this.cdr.detectChanges(); // FORCER LA DÉTECTION
      }
    });
  }
}