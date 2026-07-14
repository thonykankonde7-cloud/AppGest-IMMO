import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  HttpClient,
  HttpClientModule,
  HttpHeaders
} from '@angular/common/http';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ViewAgencyDialogComponent } from './view-agency-dialog/view-agency-dialog.component';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatDialogModule
  ],
  template: `
<div class="dashboard">

  <!-- HEADER -->
  <div class="top">
    <h2 class="title">📊 Dashboard SaaS Pro</h2>
    <p class="subtitle">Bienvenue {{ role }}</p>
  </div>

  <!-- CARDS -->
  <div class="cards">

    <ng-container *ngIf="role === 'super_admin'">

      <div class="card">
        <span>🏢</span>
        <h3>Agences</h3>
        <p>{{ stats.total_agencies || 0 }}</p>
      </div>

      <div class="card card-purple">
  <span>🏗️</span>
  <h3>Buildings</h3>
  <p>{{ stats.total_buildings || 0 }}</p>
</div>

      <div class="card">
        <span>👨‍💼</span>
        <h3>Admins</h3>
        <p>{{ stats.total_admins || 0 }}</p>
      </div>

      <div class="card">
        <span>👥</span>
        <h3>Utilisateurs</h3>
        <p>{{ stats.total_users || 0 }}</p>
      </div>

      <div class="card card-green">
        <span>💰</span>
        <h3>Revenus SaaS</h3>
        <p>{{ stats.total_income || 0 | currency:'USD' }}</p>
      </div>

      <div class="card card-orange">
  <span>🏧</span>
  <h3>Retraits SaaS</h3>
  <p>
    {{ stats.total_withdrawn || 0 | currency:'USD' }}
  </p>
</div>

<div class="card card-blue">
  <span>💳</span>
  <h3>Solde SaaS</h3>
  <p>
    {{ stats.saas_balance || 0 | currency:'USD' }}
  </p>
</div>

    </ng-container>

  </div>

<!-- SECTION CHART + AGENCIES -->
<div
  class="chart-section"
  *ngIf="role === 'super_admin'"
>

  <!-- LEFT -->
  <div class="agencies-panel">

    <h3>🏢 Agences</h3>

    <div class="agency-list">

      <div
        class="agency-item"
        *ngFor="let a of agencies"
        [class.expired-card]="a.status === 'expired'"
      >

        <div class="agency-name">
          {{ a.name }}
        </div>

        <div
          class="agency-status"
          [ngClass]="{
            'active': a.status === 'active',
            'inactive': a.status === 'expired'
          }"
        >
          {{
            a.status === 'active'
            ? '🟢 Actif'
            : '🔴 Expiré'
          }}
        </div>

        <!-- PLAN ACTUEL -->
        <div class="agency-plan">
          Plan actuel :
          <strong>
            {{ a.plan_name || 'Aucun' }}
          </strong>
        </div>

        <div class="agency-date">
          Expire :
          {{
            a.subscription_end
            ? (a.subscription_end | date:'dd/MM/yyyy':'UTC')
            : 'Aucune date'
          }}
        </div>

        <!-- FUTUR ABONNEMENT -->
        <div
          class="future-plan"
          *ngIf="a.future_plan_name"
        >
          🔮 Prochain abonnement

          <div>
            Plan :
            <strong>
              {{ a.future_plan_name }}
            </strong>
          </div>

          <div>
            Début :
            {{
              a.future_start_date
              | date:'dd/MM/yyyy':'UTC'
            }}
          </div>

          <div>
            Durée :
            <strong>
              {{ a.future_months }}
              mois
            </strong>
          </div>
        </div>

      </div>

    </div>

  </div>

  <!-- RIGHT: CHARTS -->
  <div class="charts-wrapper">

    <div class="chart-box">
      <h3>📈 Revenus mensuels SaaS</h3>
      <canvas #revenueChart></canvas>
    </div>

    <div class="chart-box">
      <h3>📊 Répartition des plans SaaS</h3>
      <canvas #planChart></canvas>
    </div>

  </div>

</div>

</div>

  `,
  styles: [`
.dashboard {
  max-width: 1100px;
  margin: 0 auto;
}

/* HEADER */
.top {
  margin-bottom: 15px;
}

.title {
  font-size: 24px;
  font-weight: 700;
}

.subtitle {
  color: #777;
}

/* CARDS */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 6px 8px;
  min-height: 60px;
  max-width: 180px; /* 🔥 réduit largeur */
  box-shadow: 0 1px 4px rgba(0,0,0,.05);
}

.card span { font-size: 16px; }
.card h3 { font-size: 11px; color: #777; }
.card p { font-size: 15px; font-weight: bold; }

.card-green {
  border-left: 3px solid #2e7d32;
}

/* CHART */
.chart-box {
  background: #fff;
  padding: 10px 12px; /* ↓ réduit */
  margin-top: 12px;
  border-radius: 10px;
  box-shadow: 0 1px 5px rgba(0,0,0,.05);
  height: 260px; /* ⭐ important: réduit hauteur */
}

.chart-box h3 {
  font-size: 12px;
  margin-bottom: 6px;
  color: #444;
}

canvas {
  max-height: 200px !important;
}

.card-orange {
  border-left: 3px solid #ff9800;
}

.card-blue {
  border-left: 3px solid #1976d2;
}

.agencies-panel h3 {
  font-size: 12px;
  margin-bottom: 8px;
}

.agency-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.agency-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 8px;
  font-size: 11px;
  background: #fafafa;
}

.agency-name {
  font-weight: bold;
  font-size: 12px;
}

.agency-status {
  font-size: 10px;
  margin-top: 4px;
  display: inline-block;
  padding: 2px 6px;
  border-radius: 6px;
}

.agency-status.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.agency-status.inactive {
  background: #ffebee;
  color: #c62828;
}

.agency-date {
  margin-top: 4px;
  font-size: 10px;
  color: #666;
}

.agency-plan {
  margin-top: 5px;
  font-size: 10px;
  color: #1976d2;
  font-weight: 600;
}

.expired-card {
  border-left: 4px solid #e53935;
  background: #fff5f5;
}

.agency-item {
  border-left: 4px solid #43a047;
}

.future-plan {
  margin-top: 8px;
  padding: 8px;
  border-radius: 8px;
  background: #eef4ff;
  border-left: 4px solid #1976d2;
  font-size: 10px;
}

.future-plan strong {
  color: #1976d2;
}

.card-purple {
  border-left: 3px solid #7b1fa2;
}
/* ================= LAYOUT ================= */
.chart-section {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-top: 20px;
}

/* ================= LEFT ================= */
.agencies-panel {
  width: 360px;
  min-width: 360px;
  max-width: 360px;

  background: #fff;
  border-radius: 20px;
  padding: 16px;

  box-shadow:
    0 4px 12px rgba(0,0,0,.05);

  height: 720px;
  overflow-y: auto;
}

/* ================= RIGHT ================= */
.charts-wrapper {
  flex: 1;

  display: flex;
  flex-direction: column;
  gap: 20px;

  min-width: 0;
}

.chart-box {
  background: #fff;
  border-radius: 20px;
  padding: 20px;

  box-shadow:
    0 4px 12px rgba(0,0,0,.05);

  height: 350px;
}

/* RESPONSIVE */
@media (max-width: 992px) {

  .chart-section {
    flex-direction: column;
  }

  .agencies-panel {
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    height: auto;
  }

  .charts-wrapper {
    width: 100%;
  }
}

  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {

  @ViewChild('revenueChart') revenueChart!: ElementRef;
  @ViewChild('planChart') planChart!: ElementRef;

  stats: any = {};
  agencies: any[] = [];
  role = '';
  monthlyRevenue: any[] = [];
  planDistribution: any[] = [];

  revenueChartInstance: Chart | null = null;
  planChartInstance: Chart | null = null;

  private apiUrl = 'http://localhost:8080/dashboard';

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    @Inject(PLATFORM_ID) private platformId: object
  ) { }

  // ================= SAFE STORAGE (FIX SSR ERROR)
  private getStorage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? localStorage : null;
  }

  getToken(): string {
    const storage = this.getStorage();
    return storage ? storage.getItem('token') || '' : '';
  }

  getRole(): string {
    const storage = this.getStorage();
    return storage ? storage.getItem('role') || '' : '';
  }

  getHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.getToken()}`
      })
    };
  }

  ngOnInit(): void {

    this.role = this.getRole();

    this.loadStats();

    if (this.role === 'super_admin') {
      this.loadAgencies();
    }
  }

  ngAfterViewInit(): void {

    if (this.role === 'super_admin') {

      setTimeout(() => {
        this.createChart();       // revenus
        this.createPlanChart();   // plans SaaS
      }, 400);

    }
  }

  // ================= STATS
  loadStats() {

    if (!this.getToken()) {
      console.log('❌ No token');
      return;
    }

    this.ngxService.start();

    this.http.get<any>(`${this.apiUrl}/stats`, this.getHeaders())
      .subscribe({
        next: (res) => {
          console.log('✅ STATS API RESPONSE:', res);

          this.stats = res || {};
          this.monthlyRevenue = res.monthly_revenue || [];
          this.planDistribution = res.plan_distribution || [];

          this.updateCharts();
          this.ngxService.stop();
        },

        error: (err) => {
          console.error('❌ STATS ERROR:', err);
          this.ngxService.stop();
        }
      });
  }

  // ================= AGENCIES
  loadAgencies() {

    this.ngxService.start();

    this.http.get<any>(
      `${this.apiUrl}/agencies`,
      this.getHeaders()
    )
      .subscribe({

        next: res => {

          console.log('✅ AGENCIES API:', res);

          this.agencies = res.agencies || [];

          console.log('LISTE:', this.agencies);

          this.ngxService.stop();
        },

        error: err => {

          console.error('❌ ERROR AGENCIES:', err);

          this.ngxService.stop();
        }
      });
  }

  // ================= CHART.JS
  createChart() {

    if (!this.revenueChart?.nativeElement) return;

    const ctx = this.revenueChart.nativeElement.getContext('2d');
    if (!ctx) return;

    // 🔥 Détruire ancien chart
    if (this.revenueChartInstance) {
      this.revenueChartInstance.destroy();
    }

    const labels = this.monthlyRevenue.map(m => m.month);
    const data = this.monthlyRevenue.map(m => m.total);

    this.revenueChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Revenus SaaS',
          data,
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25,118,210,0.15)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
  //
  createPlanChart() {

    if (!this.planChart?.nativeElement) return;

    const ctx = this.planChart.nativeElement.getContext('2d');
    if (!ctx) return;

    // 🔥 Détruire ancien chart
    if (this.planChartInstance) {
      this.planChartInstance.destroy();
    }

    const labels = this.planDistribution.map(p => p.plan);
    const data = this.planDistribution.map(p => p.total);

    this.planChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: [
            '#42a5f5',
            '#66bb6a',
            '#ffa726',
            '#ef5350',
            '#ab47bc'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  // ================= AGENCY MODAL
  viewAgency(agency: any) {
    this.dialog.open(ViewAgencyDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      data: agency
    });
  }

  // ================= SUSPEND
  suspendAgency(agency: any) {

    if (!confirm(`Suspendre ${agency.name} ?`)) return;

    this.http.patch(
      `${this.apiUrl}/agency/suspend/${agency.id}`,
      {},
      this.getHeaders()
    ).subscribe(() => {
      this.loadAgencies();
    });
  }

  updateCharts() {

    if (this.role !== 'super_admin') return;

    setTimeout(() => {

      if (this.revenueChart?.nativeElement) {
        this.createChart();
      }

      if (this.planChart?.nativeElement) {
        this.createPlanChart();
      }

    }, 200);
  }
}

