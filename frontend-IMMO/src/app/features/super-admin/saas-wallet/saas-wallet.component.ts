import {
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { TableComponent } from '../../../shared/table/table.component';
import { FormComponent } from '../../../shared/form/form.component';

@Component({
  selector: 'app-saas-wallet',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    FormsModule,
    MatSelectModule,
    TableComponent,
    FormComponent
  ],
  template: `
  <div class="page">

    <!-- HEADER -->
    <div class="header">
      <h2>💰 Wallet SaaS</h2>
      <p>Gestion des revenus et retraits plateforme</p>
    </div>

    <!-- CARDS -->
    <div class="cards">

    <mat-card class="wallet-card revenue">
        <mat-icon>payments</mat-icon>
        <div>
          <h3>{{ wallet.revenue | number }} $</h3>
          <p>Revenus totaux</p>
        </div>
      </mat-card>

      <mat-card class="card withdrawn">
        <mat-icon>account_balance</mat-icon>
        <div>
          <h3>{{ wallet.withdrawn | number }} $</h3>
          <p>Total retiré</p>
        </div>
      </mat-card>

      <mat-card class="card balance">
        <mat-icon>wallet</mat-icon>
        <div>
          <h3>{{ wallet.balance | number }} $</h3>
          <p>Solde disponible</p>
        </div>
      </mat-card>

    </div>

  <!-- WITHDRAW FORM -->

  <app-form

  subtitle="Effectuez un retrait de vos revenus SaaS"

  saveText="Retirer maintenant"

  [showCancel]="false"

  [loading]="loading"

  (save)="sendWithdraw()">

  
  <input
    type="number"
    placeholder="Montant du retrait"
    [(ngModel)]="withdraw.amount">


  <select
    [(ngModel)]="withdraw.method">


    <option value="mpesa">
      M-Pesa
    </option>


    <option value="airtel_money">
      Airtel Money
    </option>


    <option value="orange_money">
      Orange Money
    </option>


    <option value="cash">
      Cash
    </option>


    <option value="bank_transfer">
      Banque
    </option>


  </select>



  <input
    *ngIf="
      withdraw.method === 'mpesa' ||
      withdraw.method === 'airtel_money' ||
      withdraw.method === 'orange_money'
    "
    placeholder="Numéro téléphone"
    [(ngModel)]="withdraw.phone_number">



  <input

    placeholder="Note"

    [(ngModel)]="withdraw.note">


</app-form>

    <!-- TABLE -->
    <div class="table-box">

      <h3>📜 Historique des retraits</h3>

      <app-table
  [data]="withdrawals"

  [columns]="[
    'amount',
    'method',
    'status',
    'created_at'
  ]"

  [headers]="{
    amount:'Montant',
    method:'Méthode',
    status:'Statut',
    created_at:'Date'
  }"

  [dates]="['created_at']"

  [badges]="['status']"

  [badgeClasses]="{
    pending:'pending',
    approved:'approved',
    rejected:'rejected'
  }"
  [badges]="['status']"

[badgeLabels]="{
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté'
}"

  [showActions]="true"

  [showEdit]="false"
  [showDelete]="false"

  [showApprove]="true"
  [showReject]="true"

  (approve)="updateStatus($event.id,'approved')"
  (reject)="updateStatus($event.id,'rejected')">

</app-table>
    </div>


  </div>
  `,
  styles: [`
.page{
  padding:24px;
  background:#f4f7fb;
  min-height:100vh;
}

/* ===========================
   HEADER
=========================== */

.header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:25px;
}

.header h2{
  margin:0;
  font-size:28px;
  font-weight:700;
  color:#1e293b;
}

.header p{
  margin-top:5px;
  color:#64748b;
  font-size:14px;
}

/* ===========================
   CARDS
=========================== */

.cards{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
  gap:20px;
  margin-bottom:25px;
}

.card:hover{
  transform:translateY(-5px);
  box-shadow:0 15px 35px rgba(15,23,42,.15);
}

.card mat-icon{
  width:60px;
  height:60px;
  font-size:36px;

  display:flex;
  align-items:center;
  justify-content:center;

  border-radius:50%;
  color:white;
}

.card h3{
  margin:0;
  font-size:28px;
  font-weight:700;
}

.card p{
  margin-top:5px;
  color:#64748b;
  font-size:14px;
}

.wallet-card{

display:flex;

align-items:center;

gap:18px;

padding:22px;

border-radius:16px;

box-shadow:
0 8px 20px rgba(15,23,42,.08);

transition:.3s;

}

/* Revenue */

.revenue{
  background:#eef7ff;
}

.revenue mat-icon{
  background:#2196f3;
}

/* Withdraw */

.withdrawn{
  background:#fff8e7;
}

.withdrawn mat-icon{
  background:#ff9800;
}

/* Balance */

.balance{
  background:#edfdf3;
}

.balance mat-icon{
  background:#2e7d32;
}



/* ===========================
   TABLE
=========================== */

.table-box{

  background:white;

  padding:25px;

  border-radius:16px;

  box-shadow:0 8px 20px rgba(15,23,42,.08);

}

.table-box h3{

  margin-top:0;
  margin-bottom:20px;

  color:#1e293b;

}

/* ===========================
   BADGES
=========================== */

.badge{

  display:inline-flex;
  align-items:center;
  justify-content:center;

  padding:6px 14px;

  border-radius:999px;

  font-size:12px;
  font-weight:700;

}

.pending{

  background:#fff3cd;
  color:#b45309;

}

.approved{

  background:#dcfce7;
  color:#15803d;

}

.rejected{

  background:#fee2e2;
  color:#dc2626;

}

/* ===========================
   ACTIONS
=========================== */

.actions-box{

  display:flex;
  align-items:center;
  gap:10px;

}

/* ===========================
   RESPONSIVE
=========================== */

@media(max-width:768px){

  .header{

    flex-direction:column;
    align-items:flex-start;
    gap:15px;

  }

  .cards{

    grid-template-columns:1fr;

  }

}
`]
})
export class SaasWalletComponent implements OnInit {

  loading = false;

  api = 'http://localhost:8080/saas';

  wallet = {
    revenue: 0,
    withdrawn: 0,
    balance: 0
  };

  withdraw = {
    amount: 0,
    method: 'mpesa',
    phone_number: '',
    note: ''
  };

  withdrawals: any[] = [];

  constructor(
    private http: HttpClient,
    private snack: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    this.loadWallet();
    this.loadWithdrawals();
  }

  // =========================
  // HEADERS
  // =========================
  getHeaders() {

    let token = '';
  
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token') || '';
    }
  
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  getToken(): string {

    if (!isPlatformBrowser(this.platformId)) {
      return '';
    }
  
    return localStorage.getItem('token') || '';
  }

  // =========================
  // WALLET
  // =========================
  loadWallet() {
    this.http.get<any>(
      `${this.api}/wallet`,
      this.getHeaders()
    ).subscribe(res => {
      this.wallet = res;
    });
  }

  // =========================
  // WITHDRAWALS
  // =========================
  loadWithdrawals() {
    this.http.get<any>(
      `${this.api}/withdrawals`,
      this.getHeaders()
    ).subscribe(res => {
      this.withdrawals = res.withdrawals;
    });
  }

  // =========================
  // SEND WITHDRAW
  // =========================
  sendWithdraw() {


    if (this.withdraw.amount <= 0) {
    
     this.snack.open(
       'Montant invalide',
       'OK',
       {duration:2000}
     );
    
     return;
    
    }
    
    
    
    const mobileMethods = [
     'mpesa',
     'airtel_money',
     'orange_money'
    ];
    
    
    if(
     mobileMethods.includes(this.withdraw.method)
     &&
     !this.withdraw.phone_number
    ){
    
     this.snack.open(
      'Numéro téléphone requis',
      'OK',
      {duration:2000}
     );
    
     return;
    
    }
    
    
    
    this.loading=true;
    
    
    
    this.http.post(
     `${this.api}/withdraw`,
     this.withdraw,
     this.getHeaders()
    )
    
    .subscribe({
    
    next:()=>{
    
    
    this.loading=false;
    
    
    this.snack.open(
     'Demande envoyée',
     'OK',
     {duration:2000}
    );
    
    
    this.loadWallet();
    
    this.loadWithdrawals();
    
    
    
    this.withdraw={
    
     amount:0,
    
     method:'mpesa',
    
     phone_number:'',
    
     note:''
    
    };
    
    
    },
    
    
    error:(err)=>{
    
    
    this.loading=false;
    
    
    this.snack.open(
    
    err?.error?.message ||
    'Erreur retrait',
    
    'OK',
    
    {duration:2000}
    
    );
    
    
    }
    
    
    });
    
    
    }

  updateStatus(
    id: number,
    status: string
  ) {
  
    this.http.patch(
      `${this.api}/withdrawals/${id}`,
      { status },
      this.getHeaders()
    )
    .subscribe(() => {
  
      this.snack.open(
        'Retrait mis à jour',
        'OK',
        { duration: 2000 }
      );
  
      this.loadWallet();
      this.loadWithdrawals();
    });
  }

  approveWithdraw(row: any) {

    if (row.status?.toLowerCase() !== 'pending') {
      return;
    }
  
    this.updateStatus(
      row.id,
      'approved'
    );
  
  }
}
