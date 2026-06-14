import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SubscriptionPlan, UserSubscription, PaymentOrder, YapeQrInfo } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/payments`;

  getPlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<any>(`${environment.apiUrl}/plans/`).pipe(map(r => r.data));
  }

  getYapeInfo(): Observable<YapeQrInfo> {
    return this.http.get<any>(`${environment.apiUrl}/yape/info`).pipe(map(r => r.data));
  }

  createOrder(planId: string, notes?: string): Observable<PaymentOrder> {
    return this.http.post<any>(`${this.base}/orders`, { planId, notes }).pipe(map(r => r.data));
  }

  getUserOrders(): Observable<PaymentOrder[]> {
    return this.http.get<any>(`${this.base}/orders/my`).pipe(map(r => r.data));
  }

  getSubscription(): Observable<UserSubscription | null> {
    return this.http.get<any>(`${this.base}/subscription/my`).pipe(map(r => r.data));
  }

  getPendingOrders(): Observable<PaymentOrder[]> {
    return this.http.get<any>(`${this.base}/orders/pending`).pipe(map(r => r.data));
  }

  confirmPayment(orderId: string, yapeReference: string): Observable<PaymentOrder> {
    return this.http.post<any>(`${this.base}/orders/${orderId}/confirm`, { yapeReference }).pipe(map(r => r.data));
  }
}
