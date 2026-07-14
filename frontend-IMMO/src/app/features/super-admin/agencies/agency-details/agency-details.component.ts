import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser,
  DatePipe
} from '@angular/common';

import {
  HttpClient,
  HttpHeaders,
  HttpClientModule
} from '@angular/common/http';

import { ActivatedRoute } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';

import { NgxUiLoaderService } from 'ngx-ui-loader';

import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';

import {
  MatSnackBar,
  MatSnackBarModule
} from '@angular/material/snack-bar';

@Component({
  selector: 'app-agency-details',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    DatePipe,
  
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  template: `
<div class="page">

<!-- HEADER -->
<div class="hero-card">

  <div class="hero-left">

    <div class="agency-logo">
      🏢
    </div>

    <div>

      <h1>
        {{ agency?.name || 'Agence' }}
      </h1>

      <p class="sub-text">
        {{ agency?.email }}
      </p>

      <div class="status-row">

<span
  class="badge active"
  *ngIf="subscription?.state === 'active'">

  Actif
</span>

<span
  class="badge inactive"
  *ngIf="subscription?.state === 'inactive'">

  Inactif
</span>

<span
  class="badge pending"
  *ngIf="subscription?.state === 'pending'">

  En attente
</span>

<span
  class="badge inactive"
  *ngIf="subscription?.state === 'expired'">

  Expiré
</span>

<span
  class="badge inactive"
  *ngIf="subscription?.state === 'no_subscription'">

  Aucun abonnement
</span>

</div>

    </div>

  </div>

</div>

<!-- INFOS AGENCE -->
<mat-card class="table-card">

  <div class="table-header">
    <h2>🏢 Informations complètes de l'agence</h2>
  </div>

  <div class="agency-info">

    <p>
      <strong>Nom :</strong>
      {{ agency?.name }}
    </p>

    <p>
      <strong>Email :</strong>
      {{ agency?.email }}
    </p>

    <p>
      <strong>Téléphone :</strong>
      {{ agency?.phone }}
    </p>

    <p>
      <strong>Adresse :</strong>
      {{ agency?.address }}
    </p>

<p>
  <strong>Statut :</strong>
  {{ getSubscriptionLabel() }}
</p>

    <p>
      <strong>Admin principal :</strong>
      {{ agency?.owner_name }}
    </p>

    <p>
      <strong>Gmail admin :</strong>
      {{ agency?.owner_email }}
    </p>

    <p>
      <strong>Nombre utilisateurs :</strong>
      {{ stats?.total_users }}
    </p>

    <p>
      <strong>Nombre appartements :</strong>
      {{ stats?.total_apartments }}
    </p>

    <p>
      <strong>Nombre locataires :</strong>
      {{ stats?.total_tenants }}
    </p>

    <p>
      <strong>Abonnement :</strong>
      {{ subscription?.plan_name || 'Aucun' }}
    </p>

    <p>
      <strong>Début abonnement :</strong>
      {{ subscription?.start_date | date:'mediumDate' }}
    </p>

    <p>
      <strong>Fin abonnement :</strong>
      {{ subscription?.end_date | date:'mediumDate' }}
    </p>


  </div>

</mat-card>

<!-- STATS -->
<div class="stats-grid">

  <mat-card class="card">
    <mat-icon>groups</mat-icon>
    <h3>Utilisateurs</h3>
    <p>{{ stats?.total_users || 0 }}</p>
  </mat-card>

  <mat-card class="card">
    <mat-icon>meeting_room</mat-icon>
    <h3>Appartements</h3>
    <p>{{ stats?.total_apartments || 0 }}</p>
  </mat-card>

  <mat-card class="card">
    <mat-icon>people</mat-icon>
    <h3>Locataires</h3>
    <p>{{ stats?.total_tenants || 0 }}</p>
  </mat-card>

</div>

<!-- ABONNEMENT -->
<mat-card class="info-card">

  <h2>📦 Abonnement</h2>

  <div class="grid">

    <div class="item">
      <label>Plan</label>
      <p>{{ subscription?.plan_name || 'Aucun' }}</p>
    </div>

    <div class="item">
  <label>Statut abonnement</label>

  <p
    [ngClass]="{
      'text-success':
      subscription?.state === 'active',

      'text-warning':
      subscription?.state === 'pending',

      'text-danger':
      subscription?.state === 'inactive'
    }">

    {{
      subscription?.state === 'active'
      ? 'Actif'

      : subscription?.state === 'pending'
      ? 'En attente'

      : 'Inactif'
    }}

  </p>
</div>

    <div class="item">
      <label>Date début</label>
      <p>
        {{
          subscription?.start_date
          | date:'mediumDate'
        }}
      </p>
    </div>

    <div class="item">
      <label>Date expiration</label>
      <p>
        {{
          subscription?.end_date
          | date:'mediumDate'
        }}
      </p>
    </div>

  </div>

</mat-card>

<!-- ADMIN -->
<mat-card class="info-card">

  <div class="admin-header">

    <h2>👨‍💼 Admin principal</h2>

    <button
      mat-raised-button
      color="primary"
      (click)="updateOwner()">

      <mat-icon>save</mat-icon>
      Modifier
    </button>

  </div>

  <div class="grid">

    <!-- NOM -->
    <mat-form-field appearance="outline">
      <mat-label>Nom admin</mat-label>

      <input
        matInput
        [(ngModel)]="owner.fullname">
    </mat-form-field>

    <!-- EMAIL -->
    <mat-form-field appearance="outline">
      <mat-label>Email admin</mat-label>

      <input
        matInput
        [(ngModel)]="owner.email">
    </mat-form-field>

    <!-- TELEPHONE -->
    <mat-form-field appearance="outline">
      <mat-label>Téléphone admin</mat-label>

      <input
        matInput
        [(ngModel)]="owner.phone">
    </mat-form-field>

    <!-- ROLE -->
    <mat-form-field appearance="outline">
      <mat-label>Rôle admin</mat-label>

      <select
        matNativeControl
        [(ngModel)]="owner.role">

        <option value="admin">
          Admin
        </option>

        <option value="manager">
          Manager
        </option>

        <option value="agent">
          Agent
        </option>

        <option value="secretary">
          Secrétaire
        </option>
      </select>
    </mat-form-field>

  </div>

</mat-card>

<!-- USERS -->
<mat-card class="table-card">

  <h2>👥 Tous les utilisateurs</h2>

  <table mat-table [dataSource]="users">

    <ng-container matColumnDef="fullname">
      <th mat-header-cell *matHeaderCellDef>
        Nom
      </th>

      <td mat-cell *matCellDef="let item">
        {{ item.fullname }}
      </td>
    </ng-container>

    <ng-container matColumnDef="email">
      <th mat-header-cell *matHeaderCellDef>
        Email
      </th>

      <td mat-cell *matCellDef="let item">
        {{ item.email }}
      </td>
    </ng-container>

    <ng-container matColumnDef="role">
      <th mat-header-cell *matHeaderCellDef>
        Rôle
      </th>

      <td mat-cell *matCellDef="let item">
        {{ item.role }}
      </td>
    </ng-container>

    <ng-container matColumnDef="status">
      <th mat-header-cell *matHeaderCellDef>
        Statut
      </th>

      <td mat-cell *matCellDef="let item">
        {{ item.status }}
      </td>
    </ng-container>

    <tr
      mat-header-row
      *matHeaderRowDef="displayedColumns">
    </tr>

    <tr
      mat-row
      *matRowDef="let row; columns: displayedColumns;">
    </tr>

  </table>

</mat-card>

</div>

  `,
  styles: [`
.page{
  padding:24px;
  background:#f4f7fb;
  min-height:100vh;
}

.hero-card{
  background:#fff;
  border-radius:25px;
  padding:25px;
  margin-bottom:20px;
  box-shadow:0 4px 20px rgba(0,0,0,.05);
}

.hero-left{
  display:flex;
  align-items:center;
  gap:20px;
}

.agency-logo{
  width:80px;
  height:80px;
  border-radius:22px;
  background:#16a34a;
  display:flex;
  justify-content:center;
  align-items:center;
  color:#fff;
  font-size:35px;
}

.sub-text{
  color:#777;
}

.badge{
  padding:7px 16px;
  border-radius:30px;
  font-size:13px;
}

.active{
  background:#dcfce7;
  color:#166534;
}

.inactive{
  background:#fee2e2;
  color:#991b1b;
}

.info-card,
.table-card{
  border-radius:25px;
  padding:20px;
  margin-bottom:20px;
}

.grid{
  display:grid;
  grid-template-columns:
  repeat(auto-fit,minmax(250px,1fr));
  gap:20px;
  margin-top:20px;
}

.item{
  background:#f8fafc;
  border-radius:16px;
  padding:15px;
}

.item label{
  color:#888;
  font-size:13px;
}

.item p{
  margin-top:8px;
  font-weight:600;
}

.stats-grid{
  display:grid;
  grid-template-columns:
  repeat(auto-fit,minmax(220px,1fr));
  gap:15px;
  margin-bottom:20px;
}

.card{
  text-align:center;
  border-radius:25px;
  padding:20px;
}

.card mat-icon{
  font-size:45px;
  width:45px;
  height:45px;
  color:#16a34a;
}

.card p{
  font-size:32px;
  font-weight:bold;
}

.admin-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
}

table{
  width:100%;
}

.agency-info{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(250px,1fr));
  gap:15px;
  margin-top:20px;
}

.agency-info p{
  background:#f8fafc;
  padding:14px;
  border-radius:12px;
  margin:0;
  font-size:14px;
  box-shadow:0 2px 8px rgba(0,0,0,.04);
}

.agency-info strong{
  color:#16a34a;
}

.text-success{
  color:#16a34a;
  font-weight:bold;
}

.text-warning{
  color:#f59e0b;
  font-weight:bold;
}

.text-danger{
  color:#dc2626;
  font-weight:bold;
}
`]
})
export class AgencyDetailsComponent implements OnInit {

  agency: any = {};
  stats: any = {};
  subscription: any = {};
  users: any[] = [];

  owner = {
    fullname: '',
    email: '',
    phone: '',
    role: 'admin'
  };

  displayedColumns = [
    'fullname',
    'email',
    'role',
    'status'
  ];

  private apiUrl =
    'http://localhost:8080/agencies';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private ngxService: NgxUiLoaderService,
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID)
    private platformId: object
  ) {}

  ngOnInit(): void {
    this.loadAgency();
  }

  getToken(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return '';
    }

    return (
      localStorage.getItem('token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('authToken') ||
      ''
    );
  }

  getHeaders() {

    const token = this.getToken();
  
    if (!token) {
      return {
        headers: new HttpHeaders()
      };
    }
  
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  loadAgency() {

    const id =
      this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.ngxService.start();

    this.http.get<any>(
      `${this.apiUrl}/${id}/details`,
      this.getHeaders()
    )
    .subscribe({

      next: (res) => {

        this.ngxService.stop();

        console.log('DETAIL RESPONSE =>', res);

        this.agency =
          res.agency || {};

        this.stats =
          res.stats || {};

          const sub = res.subscription || {};

          this.subscription = {
            ...sub,
            state: sub.state || sub.subscription_state || 'no_subscription'
          };

        this.users =
          res.users || [];

        // ✅ FIX OWNER
        this.owner = {
          fullname:
            this.agency.owner_name || '',

          email:
            this.agency.owner_email || '',

          phone:
            this.agency.owner_phone || '',

          role:
            this.agency.owner_role || 'admin'
        };

        console.log(
          'SUBSCRIPTION =>',
          this.subscription
        );
      },

      error: (err) => {

        this.ngxService.stop();

        console.error(
          'DETAIL ERROR =>',
          err
        );

        this.snackBar.open(
          err.error?.message ||
          'Erreur chargement agence',
          'Fermer',
          {
            duration: 3000
          }
        );
      }
    });
  }

  updateOwner() {

    const id =
      this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.ngxService.start();

    this.http.put<any>(
      `${this.apiUrl}/${id}/update-owner`,
      {
        fullname: this.owner.fullname,
        email: this.owner.email,
        phone: this.owner.phone,
        role: this.owner.role
      },
      this.getHeaders()
    )
    .subscribe({

      next: (res) => {

        this.ngxService.stop();

        this.snackBar.open(
          res.message ||
          'Modification réussie',
          'OK',
          {
            duration: 3000
          }
        );

        this.loadAgency();
      },

      error: (err) => {

        this.ngxService.stop();

        this.snackBar.open(
          err.error?.message ||
          'Erreur modification',
          'Fermer',
          {
            duration: 3000
          }
        );
      }
    });
  }

  getSubscriptionLabel(): string {

    const state = this.subscription?.state;
  
    switch (state) {
  
      case 'active':
        return 'Actif';
  
      case 'expired':
        return 'Expiré';
  
      case 'pending':
        return 'En attente';
  
      case 'no_subscription':
        return 'Aucun abonnement';
  
      default:
        return 'Inactif';
    }
  }
}