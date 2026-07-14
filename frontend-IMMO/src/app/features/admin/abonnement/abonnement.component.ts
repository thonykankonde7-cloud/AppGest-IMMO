import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { PlanService } from '../../../core/services/api.service';
//import { PlanService, Plan } from './plan.service';

export interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;

  max_buildings: number;
  max_apartments: number;
  max_users: number;

  support_type: string;
  is_active: number;

  // généré côté frontend
  features?: string[];
}

@Component({
  selector: 'app-abonnement',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
  <div class="page">

    <div class="header">
      <h2>💎 Mon abonnement</h2>
      <p>Choisissez un plan adapté à votre agence</p>
    </div>

    <div class="plans">

      <div class="card"
           *ngFor="let plan of plans"
           [class.pro]="plan.is_active">

        <h3>{{ plan.name }}</h3>

        <div class="price">
          {{ plan.price }} $
          <span>/ mois</span>
        </div>

        <ul>
          <li>✔ {{ plan.max_buildings }} immeubles</li>
          <li>✔ {{ plan.max_apartments }} appartements</li>
          <li>✔ {{ plan.max_users }} utilisateurs</li>
          <li>✔ Support {{ plan.support_type }}</li>
        </ul>

        <button class="btn"
                [ngClass]="{ green: plan.is_active }"
                (click)="choisirPlan(plan)">
          Choisir ce plan
        </button>

      </div>

    </div>

    <div class="current">
      <div>
        <h4>Mon abonnement actuel</h4>
        <span class="tag">PRO</span>
        <p>Statut: <b>Actif</b></p>
        <p>Expiration: 10/06/2026</p>
      </div>

      <button class="details">
        Voir détails
      </button>
    </div>

  </div>
  `,

  styles: [`
    .page{ padding:24px; background:#f6f7fb; min-height:100vh; }

    .plans{ display:flex; gap:20px; flex-wrap:wrap; }

    .card{
      background:white;
      padding:20px;
      border-radius:14px;
      width:280px;
      box-shadow:0 2px 10px rgba(0,0,0,0.08);
    }

    .pro{
      border:2px solid #16a34a;
    }

    .price{
      font-size:26px;
      font-weight:bold;
      margin:10px 0;
    }

    ul{ list-style:none; padding:0; }
    li{ margin-bottom:8px; font-size:13px; }

    .btn{
      width:100%;
      padding:10px;
      border:none;
      background:#2563eb;
      color:white;
      border-radius:8px;
      cursor:pointer;
    }

    .green{ background:#16a34a; }

    .current{
      margin-top:30px;
      background:white;
      padding:15px;
      border-radius:10px;
      display:flex;
      justify-content:space-between;
    }

    .tag{
      background:#16a34a;
      color:white;
      padding:3px 10px;
      border-radius:20px;
    }
  `]
})
export class AbonnementComponent implements OnInit {

  plans: Plan[] = [];

  constructor(
    private router: Router,
    private planService: PlanService
  ) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans() {
    this.planService.getPlans().subscribe({
      next: (res) => {
        this.plans = res.plans;
      },
      error: (err) => {
        console.error('Erreur chargement plans', err);
      }
    });
  }

  choisirPlan(plan: Plan) {
    this.router.navigate(['/admin/demande-paiement'], {
      queryParams: { plan: plan.name }
    });
  }
}