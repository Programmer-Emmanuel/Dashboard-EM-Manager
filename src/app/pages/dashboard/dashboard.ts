import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { CommonModule } from '@angular/common';
import { InfoAdmin } from '../../models/info-admin';
import { AdminService } from '../../services/admin-service';
import { image } from '../../constant/image';

@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export default class Dashboard implements OnInit {
  admin: InfoAdmin | null = null;
  isMobileMenuOpen = false;
  showLogoutModal = false; 
  isLoading = true;

  image = image;

  constructor(
    private router: Router,
    public authService: AuthService,
    private adminService: AdminService,
    private cdr: ChangeDetectorRef // AJOUTER CE CI
  ) {}

  ngOnInit(): void {
    // Vérifier si l'utilisateur n'est pas connecté
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/connexion']);
      return;
    }
    this.loadAdminInfo();
  }

  loadAdminInfo(): void {
    this.isLoading = true;
    this.adminService.getInfoAdmin().subscribe({
      next: (response) => {
        if (response.success) {
          // Transformation en vraie instance
          this.admin = Object.assign(new InfoAdmin(), response.data);
          console.log('Admin chargé:', this.admin);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur API:', err);
        this.isLoading = false;
      }
    });
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapePress(event: Event) {
    if (this.showLogoutModal) {
      this.closeLogoutModal();
    }
    if (this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth >= 768 && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = 'unset';
  }

  openLogoutModal(): void {
    this.showLogoutModal = true;
    document.body.style.overflow = 'hidden';
    
    if (this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  closeLogoutModal(): void {
    this.showLogoutModal = false;
    document.body.style.overflow = 'unset';
  }

  logout(): void {
    this.authService.logout();
    this.closeLogoutModal();
    this.router.navigate(['/']);
  }
}