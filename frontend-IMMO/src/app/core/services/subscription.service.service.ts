import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  private apiUrl = 'http://localhost:3000/api/subscriptions';

  constructor(private http: HttpClient) {}

  createPayment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/payment/create`, data);
  }
}