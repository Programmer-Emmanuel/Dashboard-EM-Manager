import { Component, OnInit, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InfoAdmin } from '../../../models/info-admin';
import { AdminService } from '../../../services/admin-service';
import { EntrepriseService } from '../../../services/entreprise-service';
import { SoldeService } from '../../../services/solde-service';
import { AuthService } from '../../../services/auth-service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-accueil',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './accueil.html',
  styleUrl: './accueil.css',
})
export default class Accueil implements OnInit, AfterViewInit {
  // Données
  adminInfo: InfoAdmin | null = null;
  totalAdmins: number = 0;
  totalEntreprises: number = 0;
  totalEmployes: number = 0;
  totalProduits: number = 0;
  
  // Soldes
  soldeAdmin: number = 0;
  soldeEntreprises: number = 0;
  
  // États de visibilité des soldes
  showSoldeAdmin: boolean = false;
  showSoldeEntreprises: boolean = false;
  
  // États de chargement
  isLoading: boolean = true;
  isLoadingSoldes: boolean = true;
  isLoadingCharts: boolean = true;
  error: string | null = null;

  // Dernières entreprises
  recentEntreprises: any[] = [];

  // Graphiques
  chartRepartition: Chart | null = null;
  chartEvolution: Chart | null = null;
  
  // Données pour les graphiques (seront calculées)
  entreprisesParMois: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  employesParMois: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  produitsParMois: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  
  // Données brutes pour les calculs
  allEntreprises: any[] = [];
  allEmployes: any[] = [];
  allProduits: any[] = [];

  constructor(
    private adminService: AdminService,
    private entrepriseService: EntrepriseService,
    private soldeService: SoldeService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    this.waitForDataAndInitCharts();
  }

  waitForDataAndInitCharts(): void {
    const checkInterval = setInterval(() => {
      if (!this.isLoading && !this.isLoadingSoldes) {
        clearInterval(checkInterval);
        this.ngZone.run(() => {
          setTimeout(() => {
            this.initCharts();
            this.isLoadingCharts = false;
            this.cdr.detectChanges();
          }, 300);
        });
      }
    }, 100);
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;
    
    // Charger les infos de l'admin connecté
    this.adminService.getInfoAdmin().subscribe({
      next: (response) => {
        if (response.success) {
          this.adminInfo = response.data;
        }
      },
      error: (err) => {
        console.error('Erreur chargement admin:', err);
      }
    });

    // Charger les admins
    if (this.authService.isAuthenticated()) {
      this.adminService.getAdmins().subscribe({
        next: (response) => {
          if (response.success) {
            this.totalAdmins = response.data.length;
          }
        },
        error: (err) => {
          console.error('Erreur chargement admins:', err);
        }
      });
    }

    // Charger les entreprises
    this.entrepriseService.getEntreprises().subscribe({
      next: (response) => {
        if (response.success) {
          this.allEntreprises = response.data;
          this.totalEntreprises = response.data.length;
          
          // Calculer les entreprises par mois
          this.calculerEntreprisesParMois();
          
          // Charger les détails pour avoir les employés et produits
          this.loadEntreprisesDetails(response.data);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement entreprises:', err);
        this.error = 'Erreur lors du chargement des données';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });

    this.loadSoldes();
  }

  calculerEntreprisesParMois(): void {
    const mois = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const anneeActuelle = new Date().getFullYear();
    
    this.allEntreprises.forEach(entreprise => {
      const date = new Date(entreprise.created_at);
      // Ne prendre que les entreprises de l'année en cours
      if (date.getFullYear() === anneeActuelle) {
        const indexMois = date.getMonth(); // 0-11
        mois[indexMois]++;
      }
    });
    
    this.entreprisesParMois = mois;
  }

  loadEntreprisesDetails(entreprises: any[]): void {
    let totalEmployes = 0;
    let totalProduits = 0;
    let allEmployes: any[] = [];
    let allProduits: any[] = [];
    let completedRequests = 0;

    entreprises.forEach(entreprise => {
      this.entrepriseService.getEntreprise(entreprise.id).subscribe({
        next: (response) => {
          if (response.success) {
            // Compter les employés et produits
            if (response.data.employes) {
              totalEmployes += response.data.employes.length;
              allEmployes = [...allEmployes, ...response.data.employes];
            }
            if (response.data.produits) {
              totalProduits += response.data.produits.length;
              allProduits = [...allProduits, ...response.data.produits];
            }

            // Ajouter aux récentes entreprises
            if (this.recentEntreprises.length < 5) {
              this.recentEntreprises.push({
                id: response.data.id,
                nom: response.data.nom_entreprise,
                matricule: response.data.matricule_entreprise,
                directeur: `${response.data.prenom_directeur} ${response.data.nom_directeur}`,
                employes: response.data.employes?.length || 0,
                produits: response.data.produits?.length || 0,
                created_at: response.data.created_at
              });
            }
          }
          completedRequests++;
          
          if (completedRequests === entreprises.length) {
            this.totalEmployes = totalEmployes;
            this.totalProduits = totalProduits;
            this.allEmployes = allEmployes;
            this.allProduits = allProduits;
            
            // Calculer les graphiques après avoir toutes les données
            this.calculerEmployesParMois();
            this.calculerProduitsParMois();
            
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error('Erreur chargement détails entreprise:', err);
          completedRequests++;
        }
      });
    });
  }

  calculerEmployesParMois(): void {
    const mois = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const anneeActuelle = new Date().getFullYear();
    
    this.allEmployes.forEach(employe => {
      const date = new Date(employe.created_at);
      if (date.getFullYear() === anneeActuelle) {
        const indexMois = date.getMonth();
        mois[indexMois]++;
      }
    });
    
    this.employesParMois = mois;
  }

  calculerProduitsParMois(): void {
    const mois = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const anneeActuelle = new Date().getFullYear();
    
    this.allProduits.forEach(produit => {
      const date = new Date(produit.created_at);
      if (date.getFullYear() === anneeActuelle) {
        const indexMois = date.getMonth();
        mois[indexMois]++;
      }
    });
    
    this.produitsParMois = mois;
  }

  loadSoldes(): void {
    this.isLoadingSoldes = true;

    this.soldeService.getSoldeAdmin().subscribe({
      next: (response) => {
        if (response.success) {
          this.soldeAdmin = response.data;
        }
        this.checkSoldesLoaded();
      },
      error: (err) => {
        console.error('Erreur chargement solde admin:', err);
        this.checkSoldesLoaded();
      }
    });

    this.soldeService.getSoldeEntreprises().subscribe({
      next: (response) => {
        if (response.success) {
          this.soldeEntreprises = response.data;
        }
        this.checkSoldesLoaded();
      },
      error: (err) => {
        console.error('Erreur chargement solde entreprises:', err);
        this.checkSoldesLoaded();
      }
    });
  }

  private soldesLoadedCount: number = 0;
  checkSoldesLoaded(): void {
    this.soldesLoadedCount++;
    if (this.soldesLoadedCount >= 2) {
      this.isLoadingSoldes = false;
      this.cdr.detectChanges();
    }
  }

  initCharts(): void {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        // Détruire les anciens graphiques s'ils existent
        if (this.chartRepartition) {
          this.chartRepartition.destroy();
        }
        if (this.chartEvolution) {
          this.chartEvolution.destroy();
        }

        // Graphique de répartition
        const ctx1 = document.getElementById('chartRepartition') as HTMLCanvasElement;
        if (ctx1) {
          this.chartRepartition = new Chart(ctx1, {
            type: 'doughnut',
            data: {
              labels: ['Entreprises', 'Employés', 'Produits'],
              datasets: [{
                data: [this.totalEntreprises, this.totalEmployes, this.totalProduits],
                backgroundColor: [
                  'rgba(99, 102, 241, 0.8)',
                  'rgba(139, 92, 246, 0.8)',
                  'rgba(236, 72, 153, 0.8)'
                ],
                borderColor: [
                  'rgba(99, 102, 241, 1)',
                  'rgba(139, 92, 246, 1)',
                  'rgba(236, 72, 153, 1)'
                ],
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    font: { size: 12 }
                  }
                }
              }
            }
          });
        }

        // Graphique d'évolution
        const ctx2 = document.getElementById('chartEvolution') as HTMLCanvasElement;
        if (ctx2) {
          this.chartEvolution = new Chart(ctx2, {
            type: 'line',
            data: {
              labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
              datasets: [
                {
                  label: 'Entreprises',
                  data: this.entreprisesParMois,
                  borderColor: 'rgba(99, 102, 241, 1)',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  tension: 0.4,
                  fill: true
                },
                {
                  label: 'Employés',
                  data: this.employesParMois,
                  borderColor: 'rgba(139, 92, 246, 1)',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  tension: 0.4,
                  fill: true
                },
                {
                  label: 'Produits',
                  data: this.produitsParMois,
                  borderColor: 'rgba(236, 72, 153, 1)',
                  backgroundColor: 'rgba(236, 72, 153, 0.1)',
                  tension: 0.4,
                  fill: true
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  labels: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    font: { size: 12 }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: 'rgba(255, 255, 255, 0.1)' },
                  ticks: { 
                    color: 'rgba(255, 255, 255, 0.7)',
                    stepSize: 1,
                    callback: function(value: string | number) {
                      if (typeof value === 'number' && Number.isInteger(value)) {
                        return value;
                      }
                      return value; // CORRECTION: retourner la valeur dans tous les cas
                    }
                  }
                },
                x: {
                  grid: { color: 'rgba(255, 255, 255, 0.1)' },
                  ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                }
              }
            }
          });
        }
        
        this.ngZone.run(() => {
          this.cdr.detectChanges();
        });
      }, 300);
    });
  }

  // Formater le solde
  formatSolde(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant);
  }

  // Formater la date
  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Basculer la visibilité des soldes
  toggleSoldeAdmin(): void {
    this.showSoldeAdmin = !this.showSoldeAdmin;
  }

  toggleSoldeEntreprises(): void {
    this.showSoldeEntreprises = !this.showSoldeEntreprises;
  }

  // Solde masqué
  get hiddenSolde(): string {
    return '•••••••';
  }

  // Calculer le pourcentage de progression (simulé pour l'exemple)
  getAdminPercentage(): number {
    return 12;
  }

  getEntreprisePercentage(): number {
    return 8;
  }

  getEmployePercentage(): number {
    return 15;
  }

  getProduitPercentage(): number {
    return 5;
  }
}