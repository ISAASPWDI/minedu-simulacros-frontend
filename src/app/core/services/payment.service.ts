import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { HttpParams } from '@angular/common/http';
import { SubscriptionPlan, UserSubscription, PaymentOrder, YapeQrInfo } from '../models/payment.model';
import { PageResponse } from '../models/config.model';

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

  createOrder(planId: string, notes?: string, paymentImageUrl?: string): Observable<PaymentOrder> {
    return this.http.post<any>(`${this.base}/orders`, { planId, notes, paymentImageUrl }).pipe(map(r => r.data));
  }

  getUserOrders(): Observable<PaymentOrder[]> {
    return this.http.get<any>(`${this.base}/orders/my`).pipe(map(r => r.data));
  }

  getUserOrdersPaged(page = 0, size = 5): Observable<PageResponse<PaymentOrder>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<any>(`${this.base}/orders/my/page`, { params }).pipe(map(r => r.data));
  }

  getPendingOrdersPaged(page = 0, size = 10): Observable<PageResponse<PaymentOrder>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<any>(`${this.base}/orders/pending/page`, { params }).pipe(map(r => r.data));
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

  rejectPayment(orderId: string, rejectionImageUrl?: string): Observable<PaymentOrder> {
    return this.http.post<any>(`${this.base}/orders/${orderId}/reject`, { rejectionImageUrl: rejectionImageUrl ?? null }).pipe(map(r => r.data));
  }

  uploadPaymentImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.base}/upload-image`, formData, { responseType: 'text' });
  }
}
