import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SubscriptionPlan, UserSubscription, PaymentOrder, YapeQrInfo } from '../models/payment.model';
import { PageResponse } from '../models/config.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/payments`;

  getPlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<SubscriptionPlan[]>(`${environment.apiUrl}/plans`);
  }

  getYapeInfo(): Observable<YapeQrInfo> {
    return this.http.get<YapeQrInfo>(`${environment.apiUrl}/payments/yape-info`);
  }

  createOrder(planId: string, notes?: string): Observable<PaymentOrder> {
    return this.http.post<PaymentOrder>(this.base, { planId, notes });
  }

  getUserOrders(): Observable<PageResponse<PaymentOrder>> {
    return this.http.get<PageResponse<PaymentOrder>>(`${this.base}/my-orders`);
  }

  getSubscription(): Observable<UserSubscription> {
    return this.http.get<UserSubscription>(`${environment.apiUrl}/subscriptions/current`);
  }

  getPendingOrders(page: number = 0, size: number = 10): Observable<PageResponse<PaymentOrder>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString()).set('status', 'PENDING');
    return this.http.get<PageResponse<PaymentOrder>>(`${environment.apiUrl}/admin/payments`, { params });
  }

  getAllOrders(page: number = 0, size: number = 10, status?: string): Observable<PageResponse<PaymentOrder>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (status) params = params.set('status', status);
    return this.http.get<PageResponse<PaymentOrder>>(`${environment.apiUrl}/admin/payments`, { params });
  }

  confirmPayment(orderId: string, yapeReference: string): Observable<PaymentOrder> {
    return this.http.patch<PaymentOrder>(`${environment.apiUrl}/admin/payments/${orderId}/confirm`, { yapeReference });
  }

  rejectPayment(orderId: string, reason: string): Observable<PaymentOrder> {
    return this.http.patch<PaymentOrder>(`${environment.apiUrl}/admin/payments/${orderId}/reject`, { reason });
  }
}
