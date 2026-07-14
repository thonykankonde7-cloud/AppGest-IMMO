import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  MatCardModule
} from '@angular/material/card';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatSnackBar,
  MatSnackBarModule
} from '@angular/material/snack-bar';

import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';

import { PlanDialogComponent }
  from './plan-dialog/plan-dialog.component';

import { ConfirmDialogComponent }
  from './confirm-dialog/confirm-dialog.component';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormsModule } from '@angular/forms';

import {
  MatDatepickerModule
} from '@angular/material/datepicker';

import {
  MatNativeDateModule
} from '@angular/material/core';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatInputModule
} from '@angular/material/input';

import {
  NgxUiLoaderService
} from 'ngx-ui-loader';

import {
  MatTooltipModule
} from '@angular/material/tooltip';

import { MatSort } from '@angular/material/sort';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule
  ],
  template: `
  <div class="page">

    <!-- HEADER -->
    <div class="header">

      <div>
        <h2>💎 Gestion SaaS</h2>
        <p>Plans d’abonnement globaux</p>
      </div>

      <button
        mat-raised-button
        color="primary"
        (click)="createPlan()">

        <mat-icon>add</mat-icon>
        Nouveau plan
      </button>

    </div>

    <!-- STATS -->
    <div class="stats">

      <mat-card class="stat-card">
        <mat-icon>business</mat-icon>
        <div>
          <h3>{{ activeAgencies }}</h3>
          <p>Agences actives (abonnement valide)</p>
        </div>
      </mat-card>

      <mat-card class="stat-card">
  <mat-icon>check_circle</mat-icon>
  <div>
    <h3>{{ activeSubscriptions }}</h3>
    <p>Abonnements actifs</p>
  </div>
</mat-card>

<mat-card class="stat-card">
  <mat-icon>cancel</mat-icon>
  <div>
    <h3>{{ expiredSubscriptions }}</h3>
    <p>Abonnements expirés</p>
  </div>
</mat-card>

<mat-card class="stat-card">
  <mat-icon>hourglass_empty</mat-icon>
  <div>
    <h3>{{ pendingPayments }}</h3>
    <p>Paiements en attente</p>
  </div>
</mat-card>

      <mat-card class="stat-card">
        <mat-icon>payments</mat-icon>
        <div>
          <h3>{{ revenue }}$</h3>
          <p>Revenus SaaS</p>
        </div>
      </mat-card>

      <mat-card class="stat-card">
        <mat-icon>workspace_premium</mat-icon>
        <div>
          <h3>{{ activePlans }}</h3>
          <p>Plans actifs</p>
        </div>
      </mat-card>

    </div>

    <!-- LISTE DES PLANS -->
    <div class="plans">

      <mat-card
        class="plan"
        *ngFor="
  let plan of plans;
  trackBy: trackByPlan
">

        <div class="top">

          <mat-icon class="plan-icon">
            {{ plan.icon || 'star' }}
          </mat-icon>

          <span
            class="status"
            [class.active]="plan.is_active">

            {{
              plan.is_active
              ? 'Actif'
              : 'Inactif'
            }}
          </span>

        </div>

        <h3>{{ plan.name }}</h3>

        <p class="description">
          {{ plan.description || 'Aucune description' }}
        </p>

        <p class="price">
          {{ plan.price }}$
          <small>/ mois</small>
        </p>

        <ul>
          <li>
            ✔ {{ plan.max_buildings }}
            immeubles
          </li>

          <li>
            ✔ {{ plan.max_apartments }}
            appartements
          </li>

          <li>
            ✔ {{ plan.max_users }}
            utilisateurs
          </li>

          <li>
            ✔ Support :
            {{ plan.support_type }}
          </li>
        </ul>

        <div class="actions">

  <!-- EDIT -->
  <button
    mat-icon-button
    color="primary"
    matTooltip="Modifier"
    (click)="editPlan(plan)">

    <mat-icon>edit</mat-icon>
  </button>

  <!-- TOGGLE -->
  <button
    mat-icon-button
    [color]="plan.is_active ? 'warn' : 'accent'"
    matTooltip="Activer / Désactiver"
    (click)="togglePlan(plan)">

    <mat-icon>
      {{ plan.is_active ? 'toggle_off' : 'toggle_on' }}
    </mat-icon>
  </button>

  <!-- DELETE -->
  <button
    mat-icon-button
    color="warn"
    matTooltip="Supprimer"
    (click)="confirmDelete(plan)">

    <mat-icon>delete</mat-icon>
  </button>

</div>

      </mat-card>

    </div>

  </div>

<!-- SEARCH -->
<div class="search-box">

  <mat-icon class="search-icon">
    search
  </mat-icon>

  <input
    type="text"
    placeholder="Rechercher agence, référence ou statut..."
    [(ngModel)]="searchText"
    (input)="onSearch()"
  />

</div>

<!-- ===================== -->
<!-- VALIDATION PAIEMENTS -->
<!-- ===================== -->
<div class="table-card">

  <h2>💳 Validation paiements SaaS</h2>

  <table
    mat-table
    [dataSource]="dataSource"
    matSort
    class="mat-elevation-z8">

    <!-- AGENCE -->
    <ng-container matColumnDef="agency">
      <th mat-header-cell *matHeaderCellDef>
        Agence
      </th>

      <td mat-cell *matCellDef="let row">
        {{ row.agency_name }}
      </td>
    </ng-container>

    <!-- PLAN -->
    <ng-container matColumnDef="plan">
      <th mat-header-cell *matHeaderCellDef>
        Plan
      </th>

      <td mat-cell *matCellDef="let row">
        {{ row.plan_name }}
      </td>
    </ng-container>

    <!-- MONTANT -->
    <ng-container matColumnDef="amount">
      <th mat-header-cell *matHeaderCellDef>
        Montant
      </th>

      <td mat-cell *matCellDef="let row">
        {{ row.amount }} $
      </td>
    </ng-container>

    <!-- METHODE -->
    <ng-container matColumnDef="method">
      <th mat-header-cell *matHeaderCellDef>
        Méthode
      </th>

      <td mat-cell *matCellDef="let row">
        {{ row.payment_method }}
      </td>
    </ng-container>

    <!-- TELEPHONE -->
    <ng-container matColumnDef="phone">
      <th mat-header-cell *matHeaderCellDef>
        Téléphone
      </th>

      <td mat-cell *matCellDef="let row">
        {{ row.phone_number || '-' }}
      </td>
    </ng-container>
    
     <!-- TRANSACTION OU REFERENCE -->
     <ng-container matColumnDef="transaction">
  <th mat-header-cell *matHeaderCellDef>
    Transaction
  </th>

  <td mat-cell *matCellDef="let row">

  <span class="tx-badge">
  <mat-icon class="tx-icon">receipt</mat-icon>
  {{ row.transaction_id || '-' }}
</span>

  </td>
</ng-container>

<!-- DATE PAIEMENT -->
<ng-container matColumnDef="payment_date">
  <th mat-header-cell *matHeaderCellDef>
    Date paiement
  </th>

  <td mat-cell *matCellDef="let row">
    {{ row.payment_date | date:'dd MMM yyyy HH:mm' }}
  </td>
</ng-container>

    <!-- STATUT -->
    <ng-container matColumnDef="status">
      <th mat-header-cell *matHeaderCellDef>
        Statut
      </th>

      <td mat-cell *matCellDef="let row">

      <span class="badge-status"
  [ngClass]="{
    'pending': row.status === 'pending',
    'active': row.status === 'completed',
    'rejected': row.status === 'rejected'
  }">

  {{ row.status }}

</span>

      </td>
    </ng-container>

    <!-- ACTION -->
    <ng-container matColumnDef="actions">
      <th mat-header-cell *matHeaderCellDef>
        Action
      </th>

      <td mat-cell *matCellDef="let row">

      <button mat-icon-button color="primary" matTooltip="Voir détails" (click)="viewDetails(row)">
  <mat-icon>visibility</mat-icon>
</button>

<button mat-icon-button color="accent" matTooltip="PDF" (click)="exportPaymentPDF(row)">
  <mat-icon>picture_as_pdf</mat-icon>
</button>

<button *ngIf="row.status === 'pending'" mat-icon-button color="accent" (click)="approvePayment(row.id)">
  <mat-icon>task_alt</mat-icon>
</button>

<button *ngIf="row.status === 'pending'" mat-icon-button color="warn" (click)="rejectPayment(row.id)">
  <mat-icon>block</mat-icon>
</button>
</td>
    </ng-container>

    <tr
      mat-header-row
      *matHeaderRowDef="displayedColumns">
    </tr>

    <tr
      mat-row
      *matRowDef="
        let row;
        columns: displayedColumns;
      ">
    </tr>

  </table>

  <mat-paginator
    [pageSize]="5"
    [pageSizeOptions]="[5,10,20]"
    showFirstLastButtons>
  </mat-paginator>

</div>
  `,
  styles: [`
* {
  box-sizing: border-box;
}

.page {
  padding: 24px;
  min-height: 100vh;
  font-family: Inter, system-ui, sans-serif;
  background: linear-gradient(180deg, #f6f8fc 0%, #eef2f7 100%);
}

/* ================= HEADER ================= */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 18px 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
}

.header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.header p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

/* ================= STATS ================= */
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(0,0,0,0.05);
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.08);
}

.stat-card mat-icon {
  font-size: 30px;
  width: 30px;
  height: 30px;
  color: #2563eb;
}

.stat-card h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.stat-card p {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

/* ================= PLANS ================= */
.plans {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 18px;
}

.plan {
  padding: 16px;
  border-radius: 18px;
  background: #fff;
  border: 1px solid transparent;
  box-shadow: 0 10px 25px rgba(0,0,0,0.06);
  transition: all 0.25s ease;
}

.plan:hover {
  transform: translateY(-4px);
  border-color: #e5e7eb;
  box-shadow: 0 18px 35px rgba(0,0,0,0.08);
}

/* ================= TOP ================= */
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-icon {
  font-size: 34px;
  width: 34px;
  height: 34px;
  color: #2563eb;
}

/* ================= STATUS ================= */
.status {
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: #fee2e2;
  color: #b91c1c;
}

.status.active {
  background: #dcfce7;
  color: #166534;
}

/* ================= TEXT ================= */
.plan h3 {
  margin: 12px 0 6px;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.description {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 10px;
}

/* ================= PRICE ================= */
.price {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
  margin: 10px 0;
}

.price small {
  font-size: 12px;
  color: #6b7280;
}

/* ================= LIST ================= */
ul {
  list-style: none;
  padding: 0;
  margin: 10px 0;
}

ul li {
  font-size: 13px;
  color: #374151;
  margin-bottom: 6px;
}

/* ================= ACTIONS ================= */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.actions button {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #f9fafb;
  transition: all 0.2s ease;
}

.actions button:hover {
  background: #eef2ff;
  transform: scale(1.05);
}

.actions mat-icon {
  font-size: 20px;
  width: 20px;
  height: 20px;
  color: #374151;
}

/* ================= TABLE ================= */
.table-card {
  margin-top: 28px;
  background: #fff;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.06);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  padding: 12px;
  font-size: 13px;
}

td {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
  color: #111827;
}

tr:hover {
  background: #f9fafb;
}

/* ================= SEARCH ================= */
.search-box {
  position: relative;
  margin: 22px 0;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.05);
  overflow: hidden;
}

.search-box input {
  width: 100%;
  border: none;
  outline: none;
  padding: 18px 20px 18px 56px;
  font-size: 14px;
  background: transparent;
}

.search-box input::placeholder {
  color: #9ca3af;
}

.search-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

/* ================= TRANSACTION BADGE ================= */
.tx-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #eef2ff;
  color: #3730a3;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.tx-icon {
  font-size: 16px;
  width: 16px;
  height: 16px;
}

/* ================= STATUS BADGE ================= */
.badge-status {
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
}

.badge-status.pending {
  background: #fff7ed;
  color: #c2410c;
}

.badge-status.active {
  background: #dcfce7;
  color: #166534;
}

.badge-status.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.actions button {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #f9fafb;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.actions button:hover {
  transform: scale(1.1);
}

.actions mat-icon {
  font-size: 20px;
}

/* ================= MOBILE ================= */
@media (max-width: 768px) {

  .page {
    padding: 14px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .plans {
    grid-template-columns: 1fr;
  }

  .actions {
    justify-content: center;
  }
}
  `]
})
export class SubscriptionsComponent
  implements OnInit, AfterViewInit {

  private apiUrl =
    'http://localhost:8080/subscriptions';

  plans: any[] = [];

  revenue = 0;
  activePlans = 0;
  activeAgencies = 0;
  activeSubscriptions = 0;
  expiredSubscriptions = 0;
  pendingPayments = 0;

  searchText = '';

allSubscriptions: any[] = [];

  displayedColumns: string[] = [
    'agency',
    'plan',
    'amount',
    'method',
    'phone',
    'transaction',
    'payment_date',
    'status',
    'actions'
  ];

  dataSource =
    new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  @ViewChild(MatSort)
  sort!: MatSort;

  constructor(
    private http: HttpClient,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private ngxService:
      NgxUiLoaderService,

    @Inject(PLATFORM_ID)
    private platformId: object
  ) { }

  // ==========================
  // INIT
  // ==========================
  ngOnInit(): void {

    setTimeout(() => {
      this.getPlans();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  // ==========================
  // TRACK BY
  // ==========================
  trackByPlan(
    index: number,
    item: any
  ): number {

    return item?.id ?? index;
  }

  // ==========================
  // TOKEN
  // ==========================
  getToken(): string {

    if (
      !isPlatformBrowser(
        this.platformId
      )
    ) {
      return '';
    }

    const token =
      localStorage.getItem(
        'token'
      );

    if (!token) {
      console.warn(
        '❌ Aucun token trouvé'
      );
      return '';
    }

    return token;
  }

  // ==========================
  // HEADERS
  // ==========================
  getHeaders() {

    const token =
      this.getToken();

    return {
      headers:
        new HttpHeaders({
          Authorization:
            `Bearer ${token}`,
          'Content-Type':
            'application/json'
        })
    };
  }

  // ==========================
  // GET PLANS
  // ==========================
  getPlans(): void {

    this.ngxService.start();

    const url =
  `${this.apiUrl}/plans`;

    this.http.get<any>(
      url,
      this.getHeaders()
    )
      .subscribe({

        next: (res) => {

          console.log('API RESPONSE =>', res);

          this.ngxService.stop();

          this.plans =
            res.plans || [];

          this.revenue =
            Number(res.revenue) || 0;

          this.activePlans =
            Number(res.activePlans) || 0;

          this.activeSubscriptions = Number(res.activeSubscriptions) || 0;
          this.expiredSubscriptions = Number(res.expiredSubscriptions) || 0;
          this.pendingPayments = Number(res.pendingPayments) || 0;

          this.activeAgencies =
            Number(res.activeAgencies) || 0;

            this.allSubscriptions =
            res.agencySubscriptions || [];
          
          this.dataSource.data =
            [...this.allSubscriptions];

          if (this.paginator) {
            this.dataSource.paginator =
              this.paginator;
          }

          if (this.sort) {
            this.dataSource.sort =
              this.sort;
          }
        },

        error: (err) => {

          console.error(err);

          this.ngxService.stop();

          if (
            err.status === 401
          ) {

            if (
              isPlatformBrowser(
                this.platformId
              )
            ) {
              localStorage.clear();
            }

            this.snack.open(
              'Session expirée, reconnectez-vous',
              'OK',
              {
                duration: 3000
              }
            );

            return;
          }

          this.snack.open(
            'Erreur chargement SaaS',
            'OK',
            {
              duration: 3000
            }
          );
        },
        complete: () => {
          this.ngxService.stop();
        }
      });
  }

  onSearch(): void {

    const search =
      this.searchText
        .trim()
        .toLowerCase();
  
    if (!search) {
  
      this.dataSource.data =
        [...this.allSubscriptions];
  
      this.dataSource.paginator =
        this.paginator;
  
      return;
    }
  
    this.dataSource.data =
      this.allSubscriptions.filter(
        item => {
  
          const agency =
            item.agency_name
              ?.toLowerCase() || '';
  
          const reference =
            item.transaction_id
              ?.toLowerCase() || '';
  
          const status =
            item.status
              ?.toLowerCase() || '';
  
          return (
            agency.includes(search) ||
            reference.includes(search) ||
            status.includes(search)
          );
        }
      );
  
    this.dataSource.paginator =
      this.paginator;
  }    


  // ==========================
  // CREATE
  // ==========================
  createPlan(): void {

    const dialogRef =
      this.dialog.open(
        PlanDialogComponent,
        {
          width: '700px'
        }
      );

    dialogRef
      .afterClosed()
      .subscribe(result => {

        if (result) {
          this.getPlans();
        }
      });
  }

  // ==========================
  // EDIT
  // ==========================
  editPlan(
    plan: any
  ): void {

    const dialogRef =
      this.dialog.open(
        PlanDialogComponent,
        {
          width: '700px',
          data: plan
        }
      );

    dialogRef
      .afterClosed()
      .subscribe(result => {

        if (result) {
          this.getPlans();
        }
      });
  }

  // ==========================
  // TOGGLE PLAN
  // ==========================
  togglePlan(
    plan: any
  ): void {

    this.ngxService.start();

    this.http.patch(
      `${this.apiUrl}/toggle`,
      {
        id: plan.id,
        active:
          !plan.is_active
      },
      this.getHeaders()
    )
      .subscribe({

        next: () => {

          this.ngxService.stop();

          this.snack.open(
            'Plan modifié avec succès',
            'OK',
            {
              duration: 3000
            }
          );

          this.getPlans();
        },

        error: () => {

          this.ngxService.stop();

          this.snack.open(
            'Erreur modification',
            'OK',
            {
              duration: 3000
            }
          );
        }
      });
  }

  // ==========================
  // CONFIRM DELETE
  // ==========================
  confirmDelete(
    plan: any
  ): void {

    const dialogRef =
      this.dialog.open(
        ConfirmDialogComponent,
        {
          width: '420px',
          data: {
            message:
              `Voulez-vous supprimer le plan "${plan.name}" ?`
          }
        }
      );

    dialogRef
      .afterClosed()
      .subscribe(result => {

        if (result) {
          this.deletePlan(
            plan.id
          );
        }
      });
  }

  // ==========================
  // DELETE PLAN
  // ==========================
  deletePlan(
    id: number
  ): void {

    this.ngxService.start();

    this.http.delete(
      `${this.apiUrl}/${id}`,
      this.getHeaders()
    )
      .subscribe({

        next: () => {

          this.ngxService.stop();

          this.snack.open(
            'Plan supprimé avec succès',
            'OK',
            {
              duration: 3000,
              horizontalPosition:
                'right',
              verticalPosition:
                'top'
            }
          );

          this.getPlans();
        },

        error: () => {

          this.ngxService.stop();

          this.snack.open(
            'Erreur suppression',
            'OK',
            {
              duration: 3000,
              horizontalPosition:
                'right',
              verticalPosition:
                'top'
            }
          );
        }
      });
  }

  // ==========================
  // CALCUL MOIS
  // ==========================
  calculateMonths(
    start: string,
    end: string
  ): number {

    if (
      !start ||
      !end
    ) {
      return 0;
    }

    const s =
      new Date(start);

    const e =
      new Date(end);

    let months =
      (
        e.getFullYear() -
        s.getFullYear()
      ) * 12;

    months +=
      e.getMonth() -
      s.getMonth();

    return months <= 0
      ? 1
      : months;
  }

  approvePayment(id: number) {

    this.http.patch(
      `${this.apiUrl}/payment/approve/${id}`,
      {},
      this.getHeaders()
    )
      .subscribe({

        next: () => {

          this.snack.open(
            'Paiement validé',
            'OK',
            { duration: 3000 }
          );

          this.getPlans();
        },

        error: () => {

          this.snack.open(
            'Erreur validation',
            'OK',
            { duration: 3000 }
          );
        }
      });
  }

  rejectPayment(id: number) {

    this.http.patch(
      `${this.apiUrl}/payment/reject/${id}`,
      {},
      this.getHeaders()
    )
      .subscribe({

        next: () => {

          this.snack.open(
            'Paiement rejeté',
            'OK',
            { duration: 3000 }
          );

          this.getPlans();
        },

        error: () => {

          this.snack.open(
            'Erreur rejet',
            'OK',
            { duration: 3000 }
          );
        }
      });
  }

  viewDetails(row: any): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '520px',
      data: {
        type: 'details',
        title: 'Détails du paiement SaaS',
        content: [
          { label: 'Agence', value: row.agency_name },
          { label: 'Plan', value: row.plan_name },
          { label: 'Montant', value: `${row.amount} $` },
          { label: 'Méthode', value: row.payment_method },
          { label: 'Téléphone', value: row.phone_number || '-' },
          { label: 'Transaction', value: row.transaction_id || '-' },
  
          // ✅ AJOUT DATE DÉBUT
          {
            label: 'Date début',
            value: row.start_date
              ? new Date(row.start_date).toLocaleString()
              : '-'
          },
  
          // ✅ AJOUT DATE FIN
          {
            label: 'Date fin',
            value: row.end_date
              ? new Date(row.end_date).toLocaleString()
              : '-'
          },
  
          {
            label: 'Date paiement',
            value: new Date(row.payment_date).toLocaleString()
          },
  
          { label: 'Statut', value: row.status }
        ]
      }
    });
  }

  exportPaymentPDF(row: any): void {

    const doc = new jsPDF();
  
    // ===== TITLE =====
    doc.setFontSize(18);
    doc.text('Reçu de paiement SaaS', 14, 20);
  
    doc.setFontSize(11);
    doc.setTextColor(100);
  
    // ===== INFO =====
    doc.text(`Agence: ${row.agency_name}`, 14, 35);
    doc.text(`Plan: ${row.plan_name}`, 14, 42);
    doc.text(`Montant: ${row.amount} $`, 14, 49);
    doc.text(`Méthode: ${row.payment_method}`, 14, 56);
    doc.text(`Téléphone: ${row.phone_number || '-'}`, 14, 63);
    doc.text(`Transaction: ${row.transaction_id || '-'}`, 14, 70);
  
    // ✅ DATE DÉBUT
    doc.text(
      `Date début: ${
        row.start_date ? new Date(row.start_date).toLocaleString() : '-'
      }`,
      14,
      77
    );
  
    // ✅ DATE FIN
    doc.text(
      `Date fin: ${
        row.end_date ? new Date(row.end_date).toLocaleString() : '-'
      }`,
      14,
      84
    );
  
    doc.text(
      `Date paiement: ${new Date(row.payment_date).toLocaleString()}`,
      14,
      91
    );
  
    doc.text(`Statut: ${row.status}`, 14, 98);
  
    // ===== TABLE =====
    autoTable(doc, {
      startY: 110,
      head: [['Champ', 'Valeur']],
      body: [
        ['Agence', row.agency_name],
        ['Plan', row.plan_name],
        ['Montant', `${row.amount} $`],
        ['Méthode', row.payment_method],
        ['Téléphone', row.phone_number || '-'],
        ['Transaction', row.transaction_id || '-'],
  
        // ✅ AJOUT TABLE
        [
          'Date début',
          row.start_date ? new Date(row.start_date).toLocaleString() : '-'
        ],
        [
          'Date fin',
          row.end_date ? new Date(row.end_date).toLocaleString() : '-'
        ],
  
        [
          'Date paiement',
          new Date(row.payment_date).toLocaleString()
        ],
  
        ['Statut', row.status],
      ],
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [37, 99, 235]
      }
    });
  
    // ===== FOOTER =====
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      'Généré automatiquement par SaaS Manager',
      14,
      pageHeight - 10
    );
  
    // ===== SAVE =====
    doc.save(`paiement-${row.transaction_id || 'recu'}.pdf`);
  }
}

