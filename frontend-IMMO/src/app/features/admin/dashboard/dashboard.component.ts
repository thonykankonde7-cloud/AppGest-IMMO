import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser,
  CurrencyPipe
} from '@angular/common';

import {
  HttpClient,
  HttpClientModule,
  HttpHeaders
} from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CurrencyPipe
  ],
  template: `
<div class="dashboard-container">

<div class="header">
  <h1>Tableau de bord</h1>
  <p>Vue globale de votre agence immobilière</p>
</div>

<div
  class="loading"
  *ngIf="loading">

  <mat-spinner diameter="50"></mat-spinner>

</div>

<div
  class="cards-grid"
  *ngIf="!loading">

  <mat-card class="card">
    <mat-icon>business</mat-icon>
    <h2>{{ stats.total_buildings }}</h2>
    <span>Immeubles</span>
  </mat-card>

  <mat-card class="card">
    <mat-icon>apartment</mat-icon>
    <h2>{{ stats.total_apartments }}</h2>
    <span>Appartements</span>
  </mat-card>

  <mat-card class="card">
    <mat-icon>groups</mat-icon>
    <h2>{{ stats.total_tenants }}</h2>
    <span>Locataires</span>
  </mat-card>

  <mat-card class="card">
    <mat-icon>payments</mat-icon>
    <h2>{{ stats.total_payments }}</h2>
    <span>Paiements</span>
  </mat-card>

  <mat-card class="card">
    <mat-icon>description</mat-icon>
    <h2>{{ stats.total_documents }}</h2>
    <span>Documents</span>
  </mat-card>

  <mat-card class="card success">
    <mat-icon>trending_up</mat-icon>
    <h2>{{ stats.total_income | currency:'USD':'symbol':'1.0-0' }}</h2>
    <span>Revenus</span>
  </mat-card>

  <mat-card class="card danger">
    <mat-icon>money_off</mat-icon>
    <h2>{{ stats.total_expenses | number }}</h2>
    <span>Dépenses</span>
  </mat-card>

  <mat-card class="card profit">
    <mat-icon>savings</mat-icon>
    <h2>{{ stats.net_profit | number }}</h2>
    <span>Bénéfice</span>
  </mat-card>

  <mat-card class="card">
    <mat-icon>key</mat-icon>
    <h2>{{ stats.occupied_apartments }}</h2>
    <span>Occupés</span>
  </mat-card>

  <mat-card class="card">
    <mat-icon>home</mat-icon>
    <h2>{{ stats.available_apartments }}</h2>
    <span>Disponibles</span>
  </mat-card>

</div>

</div>
  `,
  styles: `
.dashboard-container {
  padding: 20px;
  background: #f5f7fb;
  min-height: 100vh;
}

.header {
  margin-bottom: 20px;
}

.header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #2e7d32;
}

.header p {
  margin-top: 4px;
  color: #777;
  font-size: 13px;
}

.loading {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.cards-grid {
  display: grid;
  gap: 15px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.card {
  padding: 14px;
  border-radius: 12px;
  text-align: center;
  min-height: 110px;

  display: flex;
  flex-direction: column;
  justify-content: center;

  box-shadow:
    0 2px 8px rgba(0,0,0,.06);

  transition: all .25s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow:
    0 6px 16px rgba(0,0,0,.12);
}

.card mat-icon {
  font-size: 28px;
  width: 28px;
  height: 28px;
  margin: 0 auto 8px;
}

.card h2 {
  margin: 4px 0;
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
}

.card span {
  font-size: 12px;
  color: #666;
}

.success {
  border-left: 4px solid #2e7d32;
}

.danger {
  border-left: 4px solid #d32f2f;
}

.profit {
  border-left: 4px solid #1565c0;
}

/* Tablette */
@media (max-width: 992px) {
  .cards-grid {
    grid-template-columns:
      repeat(auto-fit, minmax(160px, 1fr));
  }
}

/* Mobile */
@media (max-width: 768px) {

  .dashboard-container {
    padding: 12px;
  }

  .header h1 {
    font-size: 20px;
  }

  .cards-grid {
    gap: 12px;
    grid-template-columns:
      repeat(2, 1fr);
  }

  .card {
    min-height: 95px;
    padding: 12px;
  }

  .card h2 {
    font-size: 18px;
  }

  .card mat-icon {
    font-size: 24px;
    width: 24px;
    height: 24px;
  }
}

/* Très petit écran */
@media (max-width: 480px) {

  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .card {
    min-height: 85px;
    padding: 10px;
  }

  .card h2 {
    font-size: 16px;
  }

  .card span {
    font-size: 11px;
  }
}
  `
})
export class DashboardComponent implements OnInit {

  apiUrl = 'http://localhost:8080/dashboard/stats';

  loading = true;

  stats: any = {
    total_buildings: 0,
    total_apartments: 0,
    occupied_apartments: 0,
    available_apartments: 0,
    total_tenants: 0,
    total_payments: 0,
    total_documents: 0,
    total_income: 0,
    total_expenses: 0,
    net_profit: 0
  };

  constructor(
    private http: HttpClient,
    private ngxService: NgxUiLoaderService,
    @Inject(PLATFORM_ID)
    private platformId: object
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.loadDashboard();
    });
  }

  loadDashboard(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
  
    const token = localStorage.getItem('token');
  
    this.ngxService.start();
  
    this.http.get<any>(
      this.apiUrl,
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      }
    ).subscribe({
      next: (res) => {
  
        console.log('DASHBOARD API =>', res);
  
        this.stats = res;
        this.loading = false;
  
        this.ngxService.stop();
      },
  
      error: (err) => {
  
        console.error(err);
  
        this.loading = false;
  
        this.ngxService.stop();
      }
    });
  }
}
