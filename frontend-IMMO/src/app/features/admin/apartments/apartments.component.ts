import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TableComponent } from '../../../shared/table/table.component';


@Component({
  selector: 'app-apartments',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    TableComponent
  ],
  template: `
<div class="page">

<!-- HEADER -->
<div class="header">
  <div>
    <h2>🏢 Gestion des appartements</h2>
    <p>Liste et gestion des appartements</p>
  </div>

  <button class="btn-add" (click)="toggleForm()">
    ➕ Ajouter
  </button>
</div>

<!-- FORM -->
<div class="form-box" *ngIf="showForm">

  <h3>{{ isEditMode ? '✏️ Modifier appartement' : '➕ Nouvel appartement' }}</h3>

  <form (ngSubmit)="saveApartment()">

    <select [(ngModel)]="form.building_id" name="building_id" required>
      <option [ngValue]="null">Sélectionner un immeuble</option>
      <option *ngFor="let b of buildings" [value]="b.id">
        {{ b.name }}
      </option>
    </select>

    <input [(ngModel)]="form.number" name="number" placeholder="Numéro" required>
    <input [(ngModel)]="form.floor" name="floor" type="number" placeholder="Étage">
    <input [(ngModel)]="form.type" name="type" placeholder="Type">
    <input [(ngModel)]="form.rooms" name="rooms" type="number" placeholder="Pièces">
    <input [(ngModel)]="form.rent" name="rent" type="number" placeholder="Loyer">
    <input [(ngModel)]="form.charges" name="charges" type="number" placeholder="Charges">

    <select [(ngModel)]="form.status" name="status">
      <option value="available">Disponible</option>
      <option value="occupied">Occupé</option>
      <option value="maintenance">Maintenance</option>
    </select>

    <textarea [(ngModel)]="form.description" name="description" placeholder="Description"></textarea>

    <div class="form-actions">

      <button class="btn-save" type="submit">
        {{ isEditMode ? '✔ Mettre à jour' : '💾 Enregistrer' }}
      </button>

      <button class="btn-cancel" type="button" (click)="resetForm()">
        ❌ Annuler
      </button>

    </div>

  </form>
</div>

<!-- TABLE -->
<div class="table-container">

<div class="table-container">

<app-table
  [data]="apartments"

  [columns]="[
    'building_name',
    'number',
    'floor',
    'type',
    'rooms',
    'rent',
    'charges',
    'status'
  ]"

  [headers]="{
    building_name:'Immeuble',
    number:'Numéro',
    floor:'Étage',
    type:'Type',
    rooms:'Pièces',
    rent:'Loyer',
    charges:'Charges',
    status:'Statut'
  }"

  [badges]="['status']"

  [badgeLabels]="{
    available:'Disponible',
    occupied:'Occupé',
    maintenance:'Maintenance'
  }"

  [showActions]="true"
  [showEdit]="true"
  [showDelete]="true"

  (edit)="editApartment($event)"
  (delete)="deleteApartment($event.id)">
</app-table>

</div>
  `,
  styles: [`
.page {
  padding: 20px;
  background: #f4f7fb;
  min-height: 100vh;
  font-family: Arial, sans-serif;
}

/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 20px;

  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.header h2 {
  margin: 0;
  font-size: 20px;
  color: #2e7d32;
}

.header p {
  margin: 0;
  color: #777;
  font-size: 13px;
}

/* BUTTON */
.btn-add {
  background: #2e7d32;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.2s;
}

.btn-add:hover {
  background: #1b5e20;
  transform: translateY(-1px);
}

/* FORM */
.form-box {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;

  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.form-box input,
.form-box select,
.form-box textarea {
  width: 100%;
  padding: 10px;
  margin: 6px 0;

  border: 1px solid #ddd;
  border-radius: 8px;
  outline: none;
  transition: 0.2s;
}

.form-box input:focus,
.form-box select:focus,
.form-box textarea:focus {
  border-color: #2e7d32;
}

/* FORM ACTIONS */
.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.btn-save {
  background: #2e7d32;
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-save:hover {
  background: #1b5e20;
}

.btn-cancel {
  background: #d32f2f;
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #9a0007;
}

/* TABLE WRAPPER (IMPORTANT avec app-table) */
app-table {
  display: block;
  background: white;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

/* BADGES */
.available {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
}

.occupied {
  background: #ffebee;
  color: #c62828;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
}

.maintenance {
  background: #fff3cd;
  color: #ff8f00;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
}

/* ACTIONS ICONS */
.actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.icon-edit {
  color: #2e7d32;
  cursor: pointer;
}

.icon-delete {
  color: #d32f2f;
  cursor: pointer;
}

.icon-edit:hover,
.icon-delete:hover {
  transform: scale(1.2);
}
  .available { background: #e8f5e9; color: #2e7d32; }
  .occupied { background: #ffebee; color: #c62828; }
  .maintenance { background: #fff8e1; color: #f9a825; }
  `]
})
export class ApartmentsComponent implements OnInit {

  isEditMode = false;
  selectedId: number | null = null;

  apartments: any[] = [];
  showForm = false;
  buildings: any[] = [];
  private buildingsUrl = 'http://localhost:8080/buildings';

  private apiUrl = 'http://localhost:8080/apartments';

  form: any = {
    building_id: null,
    number: '',
    floor: '',
    type: '',
    rooms: 1,
    rent: 0,
    charges: 0,
    status: 'available',
    description: ''
  };

  constructor(
    private http: HttpClient,
    private ngxService: NgxUiLoaderService,
    private snack: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {

    if (isPlatformBrowser(this.platformId)) {
  
      this.load();
      this.loadBuildings();
  
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  getToken(): string {

    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token') || '';
    }
  
    return '';
  }

  getHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.getToken()}`
      })
    };
  }

  load() {

    this.ngxService.start();
  
    this.http.get<any[]>(
      this.apiUrl,
      this.getHeaders()
    ).subscribe({
      next: (res) => {
  
        this.apartments = res;
  
        this.ngxService.stop();
      },
  
      error: (err) => {
  
        console.error(err);
  
        this.ngxService.stop();
  
        this.snack.open(
          'Erreur lors du chargement des appartements',
          'OK',
          { duration: 3000 }
        );
      }
    });
  }

  saveApartment() {

    this.ngxService.start();
  
    if (this.isEditMode) {
  
      this.http.patch(
        `${this.apiUrl}/update`,
        {
          id: this.selectedId,
          ...this.form
        },
        this.getHeaders()
      ).subscribe({
        next: () => {
  
          this.ngxService.stop();
  
          this.snack.open(
            'Appartement modifié',
            'OK',
            { duration: 2000 }
          );
  
          this.load();
          this.resetForm();
        },
  
        error: (err) => {
  
          console.error(err);
  
          this.ngxService.stop();
        }
      });
  
    } else {
  
      this.http.post(
        `${this.apiUrl}/create`,
        this.form,
        this.getHeaders()
      ).subscribe({
        next: () => {
  
          this.ngxService.stop();
  
          this.snack.open(
            'Appartement ajouté',
            'OK',
            { duration: 2000 }
          );
  
          this.load();
          this.resetForm();
        },
  
        error: (err) => {
  
          console.error(err);
  
          this.ngxService.stop();
        }
      });
    }
  }

  loadBuildings() {

    this.http.get<any[]>(
      this.buildingsUrl,
      this.getHeaders()
    ).subscribe({
      next: (res) => {
        this.buildings = res;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  editApartment(apartment: any) {

    this.isEditMode = true;
    this.selectedId = apartment.id;
    this.showForm = true;
  
    this.form = {
      building_id: apartment.building_id,
      number: apartment.number,
      floor: apartment.floor,
      type: apartment.type,
      rooms: apartment.rooms,
      rent: apartment.rent,
      charges: apartment.charges,
      status: apartment.status,
      description: apartment.description
    };
  }
  
  deleteApartment(id: number) {

    if (!confirm('Voulez-vous supprimer cet appartement ?')) {
      return;
    }
  
    this.ngxService.start();
  
    this.http.delete(
      `${this.apiUrl}/delete/${id}`,
      this.getHeaders()
    ).subscribe({
      next: () => {
  
        this.ngxService.stop();
  
        this.snack.open(
          'Appartement supprimé avec succès',
          'OK',
          {
            duration: 3000
          }
        );
  
        this.load();
      },
  
      error: (err) => {
  
        console.error(err);
  
        this.ngxService.stop();
  
        this.snack.open(
          err.error?.message || 'Erreur lors de la suppression',
          'OK',
          {
            duration: 5000
          }
        );
      }
    });
  }
  
  resetForm() {

    this.showForm = false;
    this.isEditMode = false;
    this.selectedId = null;
  
    this.form = {
      building_id: null,
      number: '',
      floor: '',
      type: '',
      rooms: 1,
      rent: 0,
      charges: 0,
      status: 'available',
      description: ''
    };
  }

}