import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AppNotification } from '../models/notification.model';
import { PageResponse } from '../models/config.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/notifications`;

  getMyNotifications(page = 0, size = 10): Observable<PageResponse<AppNotification>> {
    const params = new HttpParams().set('page', page).set('size', size).set('sort', 'createdAt,desc');
    return this.http.get<{ data: PageResponse<AppNotification> }>(this.base, { params }).pipe(
      map(res => res.data)
    );
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<{ data: number }>(`${this.base}/unread-count`).pipe(
      map(res => res.data)
    );
  }

  markRead(id: string): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/read`, {});
  }

  markAllRead(): Observable<void> {
    return this.http.put<void>(`${this.base}/read-all`, {});
  }

  notifyAdmin(message: string): Observable<any> {
    return this.http.post(`${this.base}/notify-admin`, { message });
  }
}
