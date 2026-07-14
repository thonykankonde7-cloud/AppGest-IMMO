import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}

export interface PlanResponse {
  plans: Plan[];
  revenue: number;
  activePlans: number;
  activeAgencies: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  pendingPayments: number;
}

@Injectable({ providedIn: 'root' })
export class PlanService {

  // 🔥 idéalement dans environment.ts
  private api = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // =========================
  // GET PLANS + STATS
  // =========================
  getPlans(): Observable<PlanResponse> {
    return this.http.get<PlanResponse>(`${this.api}/plans`);
  }

  // =========================
  // CREATE PAYMENT
  // =========================
  createPayment(data: {
    plan: string;
    method: string;
    phone: string;
    reference: string;
    amount: number;
  }): Observable<any> {
    return this.http.post(`${this.api}/payment/create`, data);
  }

  // =========================
  // APPROVE PAYMENT (admin)
  // =========================
  approvePayment(id: number): Observable<any> {
    return this.http.patch(`${this.api}/payment/approve/${id}`, {});
  }

  // =========================
  // REJECT PAYMENT (admin)
  // =========================
  rejectPayment(id: number): Observable<any> {
    return this.http.patch(`${this.api}/payment/reject/${id}`, {});
  }
}