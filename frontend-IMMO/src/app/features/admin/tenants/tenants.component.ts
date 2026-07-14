import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders
} from '@angular/common/http';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TenantViewDialogComponent } from './tenant-view.dialog/tenant-view.dialog.component';
import { ConfirmDeleteDialogComponent }
from './confirm-delete-dialog/confirm-delete-dialog.component';
import { ConfirmSaveDialogComponent }
from './confirm-save-dialog/confirm-save-dialog.component';
import { SuccessDialogComponent } from './success-dialog/success-dialog.component';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';

import { ViewChild, AfterViewInit } from '@angular/core';
import { TableComponent } from '../../../shared/table/table.component';
import { FormComponent } from '../../../shared/form/form.component';



@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
  
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatPaginatorModule,
  
    TableComponent,
    FormComponent
  ],
  template: `
  
  <div class="tenant-container">
  
    <!-- HEADER -->
    <div class="page-header">
  
      <div class="title-section">
        <mat-icon>groups</mat-icon>
        <h1>Gestion des Locataires</h1>
        <p>Liste et gestion des locataires</p>
      </div>
  
      <button
        mat-raised-button
        color="primary"
        (click)="openAddTenantForm()">
  
        <mat-icon>person_add</mat-icon>
        Ajouter Locataire
  
      </button>
  
    </div>
  
    <!-- FORMULAIRE -->
    <app-form

*ngIf="showForm"

[title]="isEditing ? 'Modifier locataire' : 'Nouveau locataire'"

subtitle="Informations du locataire"

saveText="Enregistrer"

cancelText="Annuler"

[loading]="loading"

(save)="saveTenant()"

(cancel)="closeForm()">


<form [formGroup]="tenantForm">

  <input
    type="text"
    placeholder="Nom complet *"
    formControlName="fullname">

  <input
    type="text"
    placeholder="Téléphone"
    formControlName="phone">

  <input
    type="email"
    placeholder="Email"
    formControlName="email">

  <textarea
    rows="3"
    placeholder="Adresse"
    formControlName="address">
  </textarea>

  <input
    type="text"
    placeholder="Carte d'identité"
    formControlName="id_card">

  <select formControlName="apartment_id">

    <option value="">
      Choisir un appartement
    </option>

    <option
      *ngFor="let apt of apartments"
      [value]="apt.id">

      {{ apt.number }} - {{ apt.building }}

    </option>

  </select>

  <input
    type="date"
    formControlName="contract_start">

  <input
    type="date"
    formControlName="contract_end">

  <input
    type="number"
    placeholder="Loyer"
    formControlName="rent">

  <input
    type="number"
    placeholder="Caution"
    formControlName="deposit">

  <select formControlName="status">

    <option value="active">
      Actif
    </option>

    <option value="inactive">
      Inactif
    </option>

    <option value="pending">
      En attente
    </option>

    <option value="terminated">
      Résilié
    </option>

  </select>

  <textarea
    rows="4"
    placeholder="Notes"
    formControlName="notes">
  </textarea>
  
        </form>

</app-form>
  
  
  
    <!-- STATS -->
    <div class="stats">
  
      <mat-card class="card">
  
        <h2>{{ tenants.length }}</h2>
  
        <span>Total Locataires</span>
  
      </mat-card>
  
      <mat-card class="card">
  
        <h2>{{ activeCount }}</h2>
  
        <span>Locataires Actifs</span>
  
      </mat-card>
  
      <mat-card class="card">
  
        <h2>{{ terminatedCount }}</h2>
  
        <span>Contrats Terminés</span>
  
      </mat-card>
  
    </div>
  
    <!-- TABLEAU -->
 <mat-card class="table-card">
  
 <app-table
    [data]="tenants"
    [columns]="columns"
    [headers]="headers"

    [dates]="[
      'contract_start',
      'contract_end'
    ]"

    [badges]="['status']"

[badgeLabels]="{
  active:'Actif',
  inactive:'Inactif',
  pending:'En attente',
  terminated:'Résilié'
}"

  [badgeClasses]="{
    available:'available',
    occupied:'occupied',
    maintenance:'maintenance'
  }"

    [showActions]="true"
    [showView]="true"

    (view)="viewTenant($event)"
    (edit)="editTenant($event)"
    (delete)="deleteTenant($event)">

</app-table> 

 </mat-card>

  `,
  styles: `
/* ==========================
   PAGE
========================== */

.tenant-container {
  padding: 24px;
  min-height: 100vh;

  background:
    linear-gradient(
      180deg,
      #f8fafc 0%,
      #f1f5f9 100%
    );
}

/* ==========================
   HEADER
========================== */

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 18px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 3px 10px rgba(0,0,0,.05);
}

.page-header::before {
  content: '';
  position: absolute;

  width: 250px;
  height: 250px;

  border-radius: 50%;

  background: rgba(255,255,255,.08);

  top: -100px;
  right: -100px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 14px;
}

.title-section mat-icon {
  font-size: 36px;
  width: 36px;
  height: 36px;
}

.title-section h1 {
  margin: 0;
  color: #2e7d32;
}

.title-section p {
  margin: 0;
  color: gray;
  font-size: 13px;
}
/* =========================
   FORMULAIRE MODERNE
========================= */

app-form{
 display:block;
 margin-bottom:30px;
}


form{

 display:grid;

 grid-template-columns:
 repeat(auto-fit,minmax(280px,1fr));

 gap:18px;

 padding:25px;

 background:white;

 border-radius:22px;

 box-shadow:
 0 10px 30px rgba(0,0,0,.06);

}


form input,
form textarea,
form select{

 width:100%;

 padding:14px 16px;

 border-radius:12px;

 border:1px solid #d1d5db;

 font-size:14px;

 background:#fff;

 transition:.25s;

}


form textarea{

 resize:none;

}


form input:focus,
form textarea:focus,
form select:focus{

 outline:none;

 border-color:#16a34a;

 box-shadow:
 0 0 0 3px rgba(22,163,74,.15);

}


/* Champs larges */

form textarea{

 grid-column:
 1/-1;

}



/* =========================
   ACTIONS
========================= */


.footer-actions{

grid-column:1/-1;

display:flex;

justify-content:flex-end;

gap:15px;

padding-top:20px;

border-top:
1px solid #dcfce7;

}


.footer-actions button{

height:45px;

border-radius:12px;

padding:0 25px;

font-weight:600;

}



/* =========================
   HEADER
========================= */


.page-header{

position:relative;

overflow:hidden;

background:white;

border-radius:20px;

padding:25px;

margin-bottom:25px;

box-shadow:
0 8px 25px rgba(0,0,0,.06);

}



.title-section mat-icon{

color:#16a34a;

background:#dcfce7;

padding:10px;

border-radius:14px;

width:55px;

height:55px;

font-size:35px;

}



.title-section h1{

font-size:28px;

font-weight:700;

}



.title-section p{

color:#64748b;

}


/* ==========================
   STATISTICS CARDS
========================== */

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin: 25px 0 30px;
}


.card {
  position: relative;
  overflow: hidden;

  padding: 25px;

  min-height: 130px;

  border-radius: 24px !important;

  background: rgba(255,255,255,0.9);

  border: 1px solid #e5e7eb;

  box-shadow:
    0 8px 25px rgba(0,0,0,.06);

  display: flex;
  flex-direction: column;
  justify-content: center;

  transition:
    transform .3s ease,
    box-shadow .3s ease;
}


/* barre verticale */
.card::before {

  content:"";

  position:absolute;

  left:0;
  top:0;

  width:6px;
  height:100%;

  background:#16a34a;

}


/* effet hover */

.card:hover {

  transform:translateY(-6px);

  box-shadow:
    0 15px 35px rgba(0,0,0,.12);

}


/* chiffre */

.card h2 {

  margin:0;

  font-size:42px;

  font-weight:800;

  color:#166534;

  line-height:1;

}


/* texte */

.card span {

  margin-top:12px;

  font-size:15px;

  font-weight:600;

  color:#64748b;

}



/* couleurs différentes */

.card:nth-child(1)::before {
  background:#2563eb;
}

.card:nth-child(1) h2 {
  color:#2563eb;
}



.card:nth-child(2)::before {
  background:#16a34a;
}

.card:nth-child(2) h2 {
  color:#16a34a;
}



.card:nth-child(3)::before {
  background:#dc2626;
}

.card:nth-child(3) h2 {
  color:#dc2626;
}



/* Responsive */

@media(max-width:768px){

.stats{

grid-template-columns:1fr;

}


.card{

min-height:110px;

}


.card h2{

font-size:34px;

}

}


/* =========================
 TABLE
========================= */


.table-card{

background:white;

border-radius:22px;

padding:25px;

box-shadow:
0 10px 30px rgba(0,0,0,.05);

}


.badge{

padding:7px 16px;

border-radius:30px;

font-weight:600;

font-size:12px;

}



.active{

background:#dcfce7;

color:#15803d;

}


.pending{

background:#fef3c7;

color:#b45309;

}


.inactive{

background:#e2e8f0;

color:#475569;

}


.terminated{

background:#fee2e2;

color:#dc2626;

}




/* ==========================
   BADGES
========================== */

.badge {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  min-width: 90px;

  padding: 8px 14px;

  border-radius: 50px;

  font-size: 12px;
  font-weight: 700;
}

.active {
  background: #dcfce7;
  color: #15803d;
}

.pending {
  background: #fef3c7;
  color: #b45309;
}

.inactive {
  background: #e2e8f0;
  color: #475569;
}

.terminated {
  background: #fee2e2;
  color: #dc2626;
}

/* ==========================
   BOUTONS
========================== */
button[mat-icon-button] {
  border-radius: 12px;

  transition: all .25s ease;
}

button[mat-icon-button]:hover {
  transform: translateY(-3px);
}

.view-btn {
  color: #16a34a !important;
  background: rgba(22,163,74,.08);
}

.view-btn:hover {
  background: rgba(22,163,74,.15);
}

/* ==========================
   MATERIAL
========================== */


.mat-mdc-card {
  border-radius: 20px !important;
}

/* ==========================
   RESPONSIVE
========================== */

@media (max-width: 768px) {

.tenant-container {
  padding: 12px;
}

.page-header {
  flex-direction: column;
  align-items: flex-start;
  gap: 15px;
  padding: 20px;
}

.page-header button {
  width: 100%;
}

.title-section h1 {
  font-size: 22px;
}

.tenant-form-container {
  padding: 20px;
}

.form-grid {
  grid-template-columns: 1fr;
}

.stats {
  grid-template-columns: 1fr;
}

.footer-actions {
  flex-direction: column;
}

.footer-actions button {
  width: 100%;
}

.mat-mdc-row {
  height: auto;
  min-height: 60px;
}

table {
  min-width: 900px;
}
}

  `
})
export class TenantsComponent implements OnInit{

  isEditing = false;
editingTenantId: number | null = null;

  showForm = false;
  loading = false;

  tenants: any[] = [];
  apartments: any[] = [];

  activeCount = 0;
  terminatedCount = 0;

  @ViewChild(MatPaginator)
paginator!: MatPaginator;

  tenantForm!: FormGroup;

  columns = [
    'fullname',
    'phone',
    'building',
    'number',
    'contract_start',
    'contract_end',
    'status'
  ];
  
  headers = {
    fullname: 'Nom complet',
    phone: 'Téléphone',
    building: 'Immeuble',
    number: 'Appartement',
    contract_start: 'Début contrat',
    contract_end: 'Fin contrat',
    status: 'Statut'
  };

  apiUrl = 'http://localhost:8080/tenants';

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {

    this.tenantForm = this.fb.group({
      fullname: ['', Validators.required],
      phone: [''],
      email: [''],
      address: [''],
      id_card: [''],
      apartment_id: ['', Validators.required],
      contract_start: [''],
      contract_end: [''],
      rent: [0],
      deposit: [0],
      status: ['active'],
      notes: ['']
    });
  
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.loadTenants();
        this.loadApartments();
      });
    }
  }

  getHeaders(): HttpHeaders {

    const token =
      localStorage.getItem('token');
  
    console.log('TOKEN =>', token);
  
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  loadTenants() {

    this.ngxService.start();
  
    this.http.get<any[]>(
      this.apiUrl,
      {
        headers: this.getHeaders()
      }
    ).subscribe({
      next: (res) => {

        this.tenants = res;
    
        this.activeCount =
          res.filter(x => x.status === 'active').length;
    
        this.terminatedCount =
          res.filter(x => x.status === 'terminated').length;
    
        this.ngxService.stop();
    }
    });
  
  }

  loadApartments() {

    this.ngxService.start();
  
    this.http.get<any[]>(
      'http://localhost:8080/apartments/available',
      {
        headers: this.getHeaders()
      }
    ).subscribe({
      next: (res) => {
        this.apartments = res;
        this.ngxService.stop();
      },
  
      error: (err) => {
        console.error(err);
        this.ngxService.stop();
      }
    });
  }

  

  openAddTenantForm() {
    this.showForm = true;
  }

  closeForm() {
    this.resetForm();
  }

  saveTenant() {

    if (this.tenantForm.invalid) {
      return;
    }
  
    const dialogRef = this.dialog.open(
      ConfirmSaveDialogComponent,
      {
        width: '420px',
        disableClose: true,
        data: {
          action: this.isEditing
            ? 'modifier'
            : 'enregistrer'
        }
      }
    );
  
    dialogRef.afterClosed().subscribe(result => {
  
      if (!result) {
        return;
      }
      this.loading = true;
  
      this.ngxService.start();
  
      const request = this.isEditing
        ? this.http.put(
            `${this.apiUrl}/${this.editingTenantId}`,
            this.tenantForm.value,
            { headers: this.getHeaders() }
          )
        : this.http.post(
            `${this.apiUrl}/assign`,
            this.tenantForm.value,
            { headers: this.getHeaders() }
          );
  
      request.subscribe({
        next: () => {

          this.loading = false;
  
          this.ngxService.stop();
  
          this.dialog.open(
            SuccessDialogComponent,
            {
              width: '400px',
              data: {
                message: this.isEditing
                  ? 'Locataire modifié avec succès'
                  : 'Locataire ajouté avec succès'
              }
            }
          );
  
          this.resetForm();
          this.loadTenants();
          this.loadApartments();
        },
  
        error: (err) => {
          this.loading = false;
          console.error(err);
          this.ngxService.stop();
        }
      });
  
    });
  
  }
  
  deleteTenant(tenant: any) {

    const dialogRef = this.dialog.open(
      ConfirmDeleteDialogComponent,
      {
        width: '420px',
        disableClose: true,
        data: {
          name: tenant.fullname
        }
      }
    );
  
    dialogRef.afterClosed().subscribe(result => {
  
      if (!result) {
        return;
      }
  
      this.ngxService.start();
  
      this.http.delete(
        `${this.apiUrl}/remove/${tenant.id}`,
        {
          headers: this.getHeaders()
        }
      ).subscribe({
        next: () => {
  
          this.ngxService.stop();
  
          this.dialog.open(
            SuccessDialogComponent,
            {
              width: '400px',
              data: {
                message: 'Locataire supprimé avec succès'
              }
            }
          );
  
          this.loadTenants();
          this.loadApartments();
        },
  
        error: (err) => {
          console.error(err);
          this.ngxService.stop();
        }
      });
  
    });
  
  }

  editTenant(tenant: any) {

    this.showForm = true;
    this.isEditing = true;
    this.editingTenantId = tenant.id;
  
    this.tenantForm.patchValue({
      fullname: tenant.fullname,
      phone: tenant.phone,
      email: tenant.email,
      address: tenant.address,
      id_card: tenant.id_card,
      apartment_id: tenant.apartment_id,
      contract_start: tenant.contract_start,
      contract_end: tenant.contract_end,
      rent: tenant.rent,
      deposit: tenant.deposit,
      status: tenant.status,
      notes: tenant.notes
    });
  }

  resetForm() {

    this.tenantForm.reset({
      status: 'active',
      rent: 0,
      deposit: 0
    });
  
    this.showForm = false;
    this.isEditing = false;
    this.editingTenantId = null;
  }

  viewTenant(tenant: any) {
    this.dialog.open(TenantViewDialogComponent, {
      width: '500px',
      data: tenant
    });
  }
}
