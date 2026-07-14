import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { MatDialog } from '@angular/material/dialog';
import { AddBuildingDialogComponent } from './add-building-dialog/add-building-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TableComponent } from '../../../shared/table/table.component';


import {
  Inject,
  PLATFORM_ID
} from '@angular/core';

import {
  isPlatformBrowser
} from '@angular/common';


export interface Building {
  id: number;
  agency_id?: number;

  name: string;
  address: string;
  city?: string;

  total_floors: number;
  description?: string;

  status?: 'active' | 'inactive';

  created_at: string;
  updated_at?: string;

  total_apartments?: number;
}

@Component({
  selector: 'app-buildings',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
    MatDialogModule,
    MatFormFieldModule,
    TableComponent
  ],
  template: `
  <mat-card class="page">

<!-- HEADER -->
<div class="header">
  <div>
    <h2>🏢 Gestion des Immeubles</h2>
    <p>Administration des bâtiments de l’agence</p>
  </div>

  <button mat-raised-button color="primary" (click)="openDialog()">
    ➕ Ajouter immeuble
  </button>
</div>

<!-- TABLE -->
<mat-card class="table-card">

<app-table
  [data]="filteredBuildings"

  [columns]="[
    'name',
    'address',
    'total_floors',
    'total_apartments'
  ]"

  [headers]="{
    name:'Immeuble',
    address:'Adresse',
    total_floors:'Etages',
    total_apartments:'Appartements'
  }"

  [showActions]="true"

  [showEdit]="true"

  [showDelete]="true"

  (edit)="editBuilding($event)"

  (delete)="deleteBuilding($event.id)">
</app-table>

<div
  *ngIf="filteredBuildings.length===0"
  class="empty-state">

  <mat-icon>apartment</mat-icon>

  <h3>Aucun immeuble enregistré</h3>

  <p>
    Cliquez sur "Ajouter immeuble"
    pour commencer.
  </p>

</div>

</mat-card>

</mat-card>
  `,
  styles: [`
   .page {
  padding: 20px;
  background: #f6f7fb;
  min-height: 100vh;
}

/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: #2e7d32;
}

.header h2 {
  margin: 0;
  font-size: 22px;
}

.header p {
  margin: 0;
  color: gray;
  font-size: 13px;
}

/* FORM */
.form-card {
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 12px;
}

.form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.form-actions {
  grid-column: span 2;
  display: flex;
  justify-content: flex-end;
}

/* TABLE */
.table-card {
  padding: 10px;
  border-radius: 12px;
  overflow: hidden;
}

/* BADGES */
.badge {
  background: #e3e3e3;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
}

.badge.green {
  background: #d1f7d6;
  color: #1a7f37;
}

/* ROW HOVER */
tr.mat-row:hover {
  background: #f1f5ff;
  transition: 0.2s;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .form {
    grid-template-columns: 1fr;
  }

  .form-actions {
    grid-column: span 1;
  }

  .empty-state {
    text-align: center;
    padding: 40px;
    color: #888;
  }
  
  .empty-state mat-icon {
    font-size: 60px;
    width: 60px;
    height: 60px;
  }

  .search-box {
    width: 340px;
  
  }

  .search-box .mat-mdc-text-field-wrapper {
    border-radius: 14px !important;
    background: #f9fafc;
    border: 1px solid #e5e7eb;
  }
  
  /* champ normal */
  .search-box .mat-mdc-text-field-wrapper {
    border-radius: 12px !important;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  
  /* hover */
  .search-box:hover .mat-mdc-text-field-wrapper {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.10);
  }
  
  /* focus */
  .search-box.mat-focused .mat-mdc-text-field-wrapper {
    box-shadow: 0 0 0 3px rgba(63, 81, 181, 0.15);
  }
  
  /* icône */
  .search-box mat-icon {
    color: #666;
  }
  
  /* input */
  .search-box input {
    font-size: 14px;
  }
}
  `]
})
export class BuildingsComponent implements OnInit {

  buildings: Building[] = [];
  filteredBuildings: Building[] = [];

  constructor(
    private http: HttpClient,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {

    if (isPlatformBrowser(this.platformId)) {
  
      setTimeout(() => {
        this.loadBuildings();
      });
  
    }
  }

  // ================= TOKEN =================
  getHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.getToken()}`
      })
    };
  }

  getToken(): string {

    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token') || '';
    }
  
    return '';
  }

  // ================= LOAD =================
  loadBuildings() {

    this.ngxService.start();
  
    this.http.get<Building[]>(
      'http://localhost:8080/buildings',
      this.getHeaders()
    ).subscribe({
      next: (data) => {
  
        this.buildings = data;
        this.filteredBuildings = data;
  
        this.ngxService.stop();
      },
      error: (err) => {
  
        console.error(err);
  
        this.ngxService.stop();
  
        this.snack.open(
          'Erreur lors du chargement des immeubles',
          'OK',
          { duration: 3000 }
        );
      }
    });
  }

  // ================= CREATE =================


  // ================= DELETE =================
  deleteBuilding(id: number) {

    const confirmed = confirm(
      'Voulez-vous vraiment supprimer cet immeuble ?'
    );
  
    if (!confirmed) {
      return;
    }
  
    this.ngxService.start();
  
    this.http.delete(
      `http://localhost:8080/buildings/${id}`,
      this.getHeaders()
    ).subscribe({
      next: () => {
  
        this.ngxService.stop();
  
        this.snack.open(
          'Immeuble supprimé',
          'OK',
          { duration: 2000 }
        );
  
        this.loadBuildings();
      },
      error: (err) => {
  
        console.error(err);
  
        this.ngxService.stop();
      }
    });
  }

  openDialog() {

    const dialogRef = this.dialog.open(AddBuildingDialogComponent, {
      width: '500px'
    });
  
    dialogRef.afterClosed().subscribe(result => {

      console.log('DATA DIALOG =', result);
    
      if (!result) return;

      this.ngxService.start();
    
      this.http.post(
        'http://localhost:8080/buildings/create',
        result,
        this.getHeaders()
      ).subscribe({
        next: (res) => {
          console.log('SUCCESS =', res);

          this.ngxService.stop();
    
          this.snack.open(
            'Immeuble ajouté',
            'OK',
            { duration: 2000 }
          );
    
          this.loadBuildings();
        },
        error: (err) => {
          console.error('CREATE ERROR =', err);
          console.error('RESPONSE =', err.error);
          this.ngxService.stop();
        }
      });
    
    });
  }

  editBuilding(building: Building) {

    const dialogRef = this.dialog.open(AddBuildingDialogComponent, {
      width: '500px',
      data: building
    });
  
    dialogRef.afterClosed().subscribe(result => {
  
      if (!result) return;

      this.ngxService.start();
  
      this.http.patch(
        'http://localhost:8080/buildings/update',
        {
          id: building.id,
          ...result
        },
        this.getHeaders()
      ).subscribe({
        next: () => {
          this.ngxService.stop();
          this.snack.open('Immeuble modifié', 'OK', {
            duration: 2000
          });
  
          this.loadBuildings();
          this.ngxService.stop();
        }
      });
  
    });
  
  }

  applyFilter(event: Event) {

    const value = (event.target as HTMLInputElement)
      .value
      .toLowerCase()
      .trim();
  
    this.filteredBuildings = this.buildings.filter(
      b =>
        (b.name || '')
          .toLowerCase()
          .includes(value) ||
  
        (b.address || '')
          .toLowerCase()
          .includes(value)
    );
  }
}