import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionService } from '../../../../core/services/subscription.service.service';
//import { SubscriptionService } from '../';




@Component({
  selector: 'app-demande-paiement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page">

    <h2>Demander un paiement</h2>
    <p class="subtitle">Informations du paiement</p>

    <!-- PLAN -->
    <div class="card">
      <label>Plan sélectionné</label>
      <select [(ngModel)]="plan">
        <option value="BASIC">BASIC - 20$ / mois</option>
        <option value="PRO">PRO - 50$ / mois</option>
        <option value="ENTERPRISE">ENTERPRISE - 100$ / mois</option>
      </select>
    </div>

    <!-- METHODES -->
    <div class="card">
      <label>Méthode de paiement</label>

      <div class="methods">

        <div class="method" [class.active]="method==='MPESA'" (click)="method='MPESA'">
          📱 M-Pesa
        </div>

        <div class="method" [class.active]="method==='AIRTEL'" (click)="method='AIRTEL'">
          📱 Airtel Money
        </div>

        <div class="method" [class.active]="method==='ORANGE'" (click)="method='ORANGE'">
          📱 Orange Money
        </div>

        <div class="method" [class.active]="method==='BANK'" (click)="method='BANK'">
          🏦 Banque
        </div>

        <div class="method" [class.active]="method==='CASH'" (click)="method='CASH'">
          💵 Cash
        </div>

      </div>
    </div>

    <!-- FORM -->
    <div class="card form">

      <div class="row">
        <div>
          <label>Numéro utilisé</label>
          <input type="text" [(ngModel)]="phone" placeholder="+243..." />
        </div>

        <div>
          <label>Référence transaction</label>
          <input type="text" [(ngModel)]="reference" placeholder="MPXXXXXXXX" />
        </div>
      </div>

      <div class="row">
        <div>
          <label>Montant ($)</label>
          <input type="number" [(ngModel)]="amount" />
        </div>
      </div>

      <button class="btn" (click)="send()">
        Envoyer pour validation
      </button>

    </div>

  </div>
  `,
  styles: [`
    .page{
      padding:20px;
      background:#f6f7fb;
      min-height:100vh;
      font-family: Arial;
    }

    h2{ margin:0; }

    .subtitle{
      color:gray;
      margin-bottom:20px;
    }

    .card{
      background:white;
      padding:15px;
      border-radius:10px;
      margin-bottom:15px;
      box-shadow:0 2px 10px rgba(0,0,0,0.06);
    }

    label{
      display:block;
      font-size:13px;
      margin-bottom:5px;
      color:#555;
    }

    select, input{
      width:100%;
      padding:10px;
      border:1px solid #ddd;
      border-radius:8px;
      outline:none;
    }

    .methods{
      display:flex;
      gap:10px;
      flex-wrap:wrap;
    }

    .method{
      padding:10px 15px;
      border:1px solid #ddd;
      border-radius:8px;
      cursor:pointer;
      background:#fff;
      transition:0.2s;
    }

    .method:hover{
      border-color:#2563eb;
    }

    .active{
      border:2px solid #16a34a;
      background:#eaffea;
    }

    .form .row{
      display:flex;
      gap:10px;
      margin-bottom:10px;
    }

    .form .row div{
      flex:1;
    }

    .btn{
      width:100%;
      padding:12px;
      border:none;
      background:#2563eb;
      color:white;
      border-radius:8px;
      cursor:pointer;
      margin-top:10px;
    }
  `]
})
export class DemandePaiementComponent {

  plan = 'PRO';
  method = 'MPESA';
  phone = '';
  reference = '';
  amount = 50;

  constructor(
    private route: ActivatedRoute,
    private subscriptionService: SubscriptionService
  ) {
    // 🔥 récupérer plan depuis URL
    this.route.queryParams.subscribe(params => {

      const plan = params['plan'];

      if (plan) {
        this.plan = plan;

        const prices: any = {
          BASIC: 20,
          PRO: 50,
          ENTERPRISE: 100
        };

        this.amount = prices[plan] || 50;
      }
    });
  }

  send() {
    const payload = {
      plan: this.plan,
      method: this.method,
      phone: this.phone,
      reference: this.reference,
      amount: this.amount
    };

    this.subscriptionService.createPayment(payload)
      .subscribe({
        next: () => alert('Demande envoyée ✅'),
        error: () => alert('Erreur ❌')
      });
  }
}