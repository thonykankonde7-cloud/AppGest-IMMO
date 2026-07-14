import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID
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

import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { NgxUiLoaderService } from 'ngx-ui-loader';
import { FormsModule } from '@angular/forms';
import { TableComponent } from '../../../shared/table/table.component';


@Component({
  selector: 'app-payments',
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

<div class="header">

  <div>
    <h2>💰 Gestion des paiements</h2>
    <p>Suivi des loyers et encaissements</p>
  </div>

  <button
    class="btn-add"
    (click)="toggleForm()">

    ➕ Ajouter paiement

  </button>

</div>

<div
  class="form-box"
  *ngIf="showForm">

  <h3>Nouveau paiement</h3>

  <select
  name="tenant_id"
  [(ngModel)]="form.tenant_id"
  (change)="onTenantChange()">

    <option [ngValue]="null">
      Sélectionner un locataire
    </option>

    <option
      *ngFor="let t of tenants"
      [value]="t.id">

      {{ t.fullname }}

    </option>

  </select>

  <select
  [(ngModel)]="form.apartment_id"
  disabled>

    <option [ngValue]="null">
      Sélectionner un appartement
    </option>

    <option
      *ngFor="let a of apartments"
      [value]="a.id">

      {{ a.number }}

    </option>

  </select>

  <input
  type="number"
  placeholder="Montant"
  [(ngModel)]="form.amount"
  readonly>

<input
  name="due_date"
  type="date"
  [(ngModel)]="form.due_date">

  <div class="form-actions">

    <button
      class="btn-save"
      (click)="createPayment()">

      Enregistrer

    </button>

    <button
      class="btn-cancel"
      (click)="toggleForm()">

      Annuler

    </button>

  </div>

</div>

<app-table
  [data]="payments"

  [columns]="[
    'id',
    'fullname',
    'apartment',
    'amount',
    'amount_paid',
    'due_date',
    'status'
  ]"

  [headers]="{
    id: 'ID',
    fullname: 'Locataire',
    apartment: 'Appartement',
    amount: 'Montant',
    amount_paid: 'Payé',
    due_date: 'Échéance',
    status: 'Statut'
  }"

  [dates]="['due_date']"

  [badges]="['status']"

  [badgeClasses]="{
    pending: 'pending',
    partial: 'partial',
    completed: 'completed'
  }"

  [showActions]="true"
  [showEdit]="false"
  [showDelete]="true"

  (delete)="deletePayment($event.id)"
  (rowClick)="pay($event)"
>
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

.form-box select,
.form-box input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;

  border: 1px solid #ddd;
  border-radius: 8px;
  outline: none;
}

.form-box select:focus,
.form-box input:focus {
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

.btn-cancel {
  background: #d32f2f;
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
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
.pending {
  background: #fff3cd;
  color: #ff8f00;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
}

.partial {
  background: #e3f2fd;
  color: #1565c0;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
}

.completed {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
}

/* ICONS */
.icon-pay,
.icon-delete {
  cursor: pointer;
  transition: 0.2s;
}

.icon-pay:hover,
.icon-delete:hover {
  transform: scale(1.2);
}

.actions {
  display: flex;
  gap: 10px;
}

.icon-pay {
  color: #2e7d32;
  cursor: pointer;
}

.icon-delete {
  color: #d32f2f;
  cursor: pointer;
}

.icon-pay:hover,
.icon-delete:hover {
  transform: scale(1.15);
}

.btn-add {
  background: #2e7d32;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
}

.form-box {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.form-box select,
.form-box input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.btn-save {
  background: #2e7d32;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
}

.btn-cancel {
  background: #d32f2f;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
}
  `]
})
export class PaymentsComponent implements OnInit {

  showForm = false;

tenants: any[] = [];
apartments: any[] = [];

form = {
  tenant_id: null,
  apartment_id: null,
  amount: 0,
  due_date: ''
};

  payments: any[] = [];

  private apiUrl = 'http://localhost:8080/payments';

  constructor(
    private http: HttpClient,
    private snack: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {

    if (isPlatformBrowser(this.platformId)) {
      this.loadPayments();
      this.loadTenants();
      this.loadApartments();
    }
  
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

  loadPayments() {

    this.ngxService.start();

    this.http.get<any[]>(
      this.apiUrl,
      this.getHeaders()
    ).subscribe({
      next: (res) => {

        this.payments = res;

        this.ngxService.stop();
      },
      error: (err) => {

        console.error(err);

        this.ngxService.stop();
      }
    });
  }

  pay(payment: any) {

    const amount = Number(prompt('Montant payé') || 0);

    if (!amount) {
      return;
    }

    this.ngxService.start();

    this.http.post(
      `${this.apiUrl}/pay`,
      {
        id: payment.id,
        amount_paid: Number(amount),
        method: 'cash'
      },
      this.getHeaders()
    ).subscribe({
      next: () => {

        this.snack.open(
          'Paiement effectué',
          'OK',
          { duration: 2000 }
        );

        this.loadPayments();
      },
      error: (err) => {

        console.error(err);

        this.ngxService.stop();
      }
    });
  }

  deletePayment(id: number) {

    if (!confirm('Supprimer ce paiement ?')) {
      return;
    }

    this.ngxService.start();

    this.http.delete(
      `${this.apiUrl}/${id}`,
      this.getHeaders()
    ).subscribe({
      next: () => {

        this.snack.open(
          'Paiement supprimé',
          'OK',
          { duration: 2000 }
        );

        this.loadPayments();
      },
      error: (err) => {

        console.error(err);

        this.ngxService.stop();
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }
  
  loadTenants() {
    this.http.get<any[]>(
      'http://localhost:8080/tenants',
      this.getHeaders()
    ).subscribe({
      next: res => {
        console.log('TENANTS =', res);
        this.tenants = res;
      }
    });
  }
  
  loadApartments() {
    this.http.get<any[]>(
      'http://localhost:8080/apartments',
      this.getHeaders()
    ).subscribe({
      next: res => {
        console.log('APARTMENTS =', res);
        this.apartments = res;
      }
    });
  }
  
  createPayment() {

    if (
      !this.form.tenant_id ||
      !this.form.apartment_id ||
      this.form.amount <= 0 ||
      !this.form.due_date
    ) {
  
      this.snack.open(
        'Veuillez remplir tous les champs',
        'OK',
        { duration: 3000 }
      );
  
      return;
    }
  
    this.ngxService.start();
  
    this.http.post(
      `${this.apiUrl}/create`,
      this.form,
      this.getHeaders()
    ).subscribe({
      next: () => {
  
        this.snack.open(
          'Paiement créé avec succès',
          'OK',
          { duration: 2000 }
        );
  
        this.form = {
          tenant_id: null,
          apartment_id: null,
          amount: 0,
          due_date: ''
        };
  
        this.showForm = false;
  
        this.loadPayments();
  
        this.ngxService.stop();
      },
      error: (err) => {
  
        console.error(err);
  
        this.snack.open(
          err.error?.message || 'Erreur lors de la création',
          'OK',
          { duration: 3000 }
        );
  
        this.ngxService.stop();
      }
    });
  
  }

  onTenantChange() {

    const tenant = this.tenants.find(
      t => t.id == this.form.tenant_id
    );
  
    if (!tenant) return;
  
    // 🔥 remplir automatiquement
    this.form.apartment_id = tenant.apartment_id;
    this.form.amount = tenant.rent;
  }
}