import { Component, HostListener } from '@angular/core';
import { image } from '../../constant/image';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav',
  imports: [RouterModule, CommonModule],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})

export class Nav {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}
  
  isMobileMenuOpen = false;
  showLogoutModal = false;

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
    // Optionnel : Empêcher le scroll du body quand le menu mobile est ouvert
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth >= 768) { // 768px est le breakpoint md de Tailwind
      this.isMobileMenuOpen = false;
      document.body.style.overflow = 'unset';
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapePress(event: Event) {
    if (this.showLogoutModal) {
      this.closeLogoutModal();
    }
  }

  openLogoutModal() {
    this.showLogoutModal = true;
    // Empêcher le scroll du body quand la modal est ouverte
    document.body.style.overflow = 'hidden';
    
    // Fermer le menu mobile si ouvert
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  closeLogoutModal() {
    this.showLogoutModal = false;
    // Réactiver le scroll du body
    document.body.style.overflow = 'unset';
  }

  logout() {
    // Appeler le service de déconnexion
    this.authService.logout();
    
    // Fermer la modal
    this.closeLogoutModal();
    
    // Rediriger vers la page d'accueil
    this.router.navigate(['/']);
  }

  image = image
}