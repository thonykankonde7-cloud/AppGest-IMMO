import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';

import { CommonModule, isPlatformBrowser, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog/confirm-delete-dialog.component';
import { ConfirmStatusDialogComponent } from './confirm-status-dialog/confirm-status-dialog.component';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TableComponent } from '../../../shared/table/table.component';
import { FormComponent } from '../../../shared/form/form.component';

@Component({
  selector: 'app-agencies',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    RouterModule,
    TableComponent,
    FormComponent
  ],
  template: `
  <div class="page">

    <div class="header">
      <div>
        <h1>🏢 Gestion des agences</h1>
        <p>Créer et gérer les agences SaaS</p>
      </div>

      <button class="create-btn" (click)="showForm = !showForm">
        <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon>
        {{ showForm ? 'Fermer' : 'Nouvelle agence' }}
      </button>
    </div>

  <!-- FORM -->
<div class="form-container" *ngIf="showForm">

<app-form

  subtitle="Informations de l'agence"
  saveText="Créer l'agence"

  [loading]="loading"

  (save)="createAgency()"

  (cancel)="showForm=false"
  cancelText="Fermer"
  saveTooltip="Créer une nouvelle agence"
  cancelTooltip="Fermer le formulaire">
  


  <!-- ================= AGENCE ================= -->

  <div class="section-title">
    🏢 Informations agence
  </div>


  <input
    placeholder="Nom de l'agence"
    [(ngModel)]="agency.name">


  <input
    placeholder="Email agence"
    [(ngModel)]="agency.email">


  <input
    placeholder="Téléphone agence"
    [(ngModel)]="agency.phone">


  <input
    placeholder="Adresse agence"
    [(ngModel)]="agency.address">



  <!-- ================= ADMIN ================= -->

  <div class="section-title admin-title">
    👤 Administrateur de l'agence
  </div>


  <input
    placeholder="Nom complet administrateur"
    [(ngModel)]="agency.admin.fullname">


  <input
    placeholder="Email administrateur"
    [(ngModel)]="agency.admin.email">


  <input
    placeholder="Téléphone administrateur"
    [(ngModel)]="agency.admin.phone">


<div class="password-field">

  <input
    [type]="showPassword ? 'text' : 'password'"
    placeholder="Mot de passe administrateur"
    [(ngModel)]="agency.admin.password">


  <button
    type="button"
    class="eye-btn"
    (click)="showPassword = !showPassword">


    <mat-icon>
      {{ showPassword ? 'visibility_off' : 'visibility' }}
    </mat-icon>


  </button>

</div>


</app-form>

</div>
    

    <!-- TABLE -->
    <div class="table-card">

<app-table

  [data]="agencies"

  [columns]="[
    'name',
    'email',
    'phone',
    'total_users',
    'plan_name',
    'end_date',
    'subscription_state'
  ]"

  [headers]="{
    name:'Agence',
    email:'Email',
    phone:'Téléphone',
    total_users:'Utilisateurs',
    plan_name:'Plan',
    end_date:'Fin abonnement',
    subscription_state:'Statut'
  }"

  [dates]="['end_date']"

  [badges]="['subscription_state']"

  [badgeLabels]="{
    active:'Actif',
    pending:'En attente',
    expired:'Expiré',
    inactive:'Inactif',
    no_subscription:'Inactif'
  }"

  [badgeClasses]="{
    active:'active',
    pending:'pending',  
    expired:'expired',
    inactive:'inactive',
    no_subscription:'inactive'
  }"

  [showActions]="true"
  [showView]="true"
  [showEdit]="false"
  [showDelete]="true"

  (view)="viewAgency($event)"
  (delete)="deleteAgency($event)">
</app-table>

</div>

  </div>
  `,
styles: [`
.page {
  padding: 28px;
  background: #f6f8fc;
  min-height: 100vh;
  font-family: Arial, sans-serif;
}
/* FORM CONTAINER */

.form-container {

margin-bottom:25px;

}


/* TABLE CARD */

.table-card {

background:white;

padding:25px;

border-radius:20px;

box-shadow:
0 10px 30px rgba(15,23,42,.08);

transition:.25s ease;

}


.table-card:hover {

transform:translateY(-3px);

box-shadow:
0 15px 35px rgba(15,23,42,.12);

}


/* HEADER */

.header {

display:flex;

justify-content:space-between;

align-items:center;

margin-bottom:30px;

}


.header h1 {

margin:0;

font-size:24px;

font-weight:700;

color:#166534;

}


.header p {

margin-top:8px;

color:#64748b;

font-size:14px;

}

/* ADMIN*/
.section-title {

grid-column:1 / -1;

margin-top:10px;

padding:12px 15px;

background:#f0fdf4;

border-left:4px solid #16a34a;

border-radius:10px;

font-weight:700;

color:#166534;

}


.admin-title {

margin-top:20px;

background:#eff6ff;

border-left-color:#2563eb;

color:#1d4ed8;

}

/* BOUTON CREATION */

.create-btn {

display:flex;

align-items:center;

gap:8px;

background:
linear-gradient(
135deg,
#16a34a,
#22c55e
);

color:white;

border:none;

padding:12px 20px;

border-radius:14px;

font-weight:600;

cursor:pointer;

box-shadow:
0 8px 20px rgba(34,197,94,.25);

transition:.25s;

}


.create-btn:hover {

transform:translateY(-2px);

box-shadow:
0 12px 25px rgba(34,197,94,.35);

}

/* BADGES */
.badge {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.active {
  background: #dcfce7;
  color: #166534;
}

.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.pending {
  background: #fef3c7;
  color: #92400e;
}

.expired {
  background: #e5e7eb;
  color: #374151;
}

/* MOT DE PASSE  */
.password-field {

position:relative;

width:100%;

}


.password-field input {

width:100%;

padding-right:50px;

box-sizing:border-box;

}


.eye-btn {

position:absolute;

right:8px;

top:50%;

transform:translateY(-50%);

border:none;

background:transparent;

cursor:pointer;

color:#64748b;

display:flex;

align-items:center;

justify-content:center;

}


.eye-btn:hover {

color:#16a34a;

}


.eye-btn mat-icon {

font-size:22px;

}

/* MATERIAL BUTTONS (override léger) */
button[mat-button] {
  border-radius: 10px;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
`]
})
export class AgenciesComponent implements OnInit {

  agencies: any[] = [];
  showPassword = false;

  loading = false;
  showForm = false;

  private apiUrl = 'http://localhost:8080/agencies';

  agency = {
    name: '',
    email: '',
    phone: '',
    address: '',
    admin: {
      fullname: '',
      email: '',
      phone: '',
      password: ''
    }
  };

  constructor(
    private http: HttpClient,
    private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,
    private router: Router, // ✅ AJOUT
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    this.getAgencies();
  }

  getToken(): string {
    if (!isPlatformBrowser(this.platformId)) return '';
    return localStorage.getItem('token') || '';
  }

  getHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.getToken()}`
      })
    };
  }

  // ================= GET =================
  getAgencies() {

    this.ngxService.start(); // ✅ START LOADER
  
    const token = this.getToken();
    if (!token) {
      this.ngxService.stop();
      return;
    }
  
    this.http.get<any>(this.apiUrl, this.getHeaders())
      .subscribe({
        next: (res) => {
  
          this.ngxService.stop(); // ✅ STOP LOADER
  
          this.agencies =
            Array.isArray(res)
              ? res
              : res.agencies || [];
        },
  
        error: (err) => {
          this.ngxService.stop(); // ❌ important
  
          console.error(err);
        }
      });
  }

  // ================= CREATE =================
  createAgency() {

    this.ngxService.start(); // ✅
  
    this.loading = true;
  
    this.http.post(`${this.apiUrl}/create`, this.agency, this.getHeaders())
      .subscribe({
        next: () => {
  
          this.ngxService.stop(); // ✅
  
          this.loading = false;
          this.showForm = false;
          this.resetForm();
          this.getAgencies();
        },
  
        error: () => {
          this.ngxService.stop(); // ❌
  
          this.loading = false;
        }
      });
  }

  changeStatus(item: any, status: string) {

    const dialogRef = this.dialog.open(ConfirmStatusDialogComponent, {
      width: '420px',
      data: {
        name: item.name,
        status: status
      }
    });
  
    dialogRef.afterClosed().subscribe((result: boolean) => {
  
      if (!result) return;
  
      this.ngxService.start();
  
      this.http.patch(
        `${this.apiUrl}/status`,
        { id: item.id, status },
        this.getHeaders()
      ).subscribe({
        next: () => {
          this.ngxService.stop();
          this.getAgencies();
        },
        error: () => {
          this.ngxService.stop();
        }
      });
  
    });
  }

  viewAgency(item: any) {
    this.router.navigate([
      '/super-admin/agencies',
      item.id
    ]);
  }

  deleteAgency(item: any) {

    const dialogRef = this.dialog.open(
      ConfirmDeleteDialogComponent,
      {
        width: '420px',
        data: {
          name: item.name
        }
      }
    );
  
    dialogRef.afterClosed().subscribe(result => {
  
      if (!result) return;
  
      this.ngxService.start();
  
      this.http.delete(
        `${this.apiUrl}/${item.id}`,
        this.getHeaders()
      ).subscribe({
  
        next: () => {
          this.ngxService.stop();
          this.getAgencies();
        },
  
        error: () => {
          this.ngxService.stop();
        }
  
      });
  
    });
  
  }

  resetForm() {
    this.agency = {
      name: '',
      email: '',
      phone: '',
      address: '',
      admin: {
        fullname: '',
        email: '',
        phone: '',
        password: ''
      }
    };
  }
}