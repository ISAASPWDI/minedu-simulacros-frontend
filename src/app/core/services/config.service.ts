import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SystemConfig } from '../models/config.model';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/config`;

  getAllConfigs(): Observable<SystemConfig[]> {
    return this.http.get<SystemConfig[]>(this.base);
  }

  updateConfig(key: string, value: string): Observable<SystemConfig> {
    return this.http.put<SystemConfig>(`${this.base}/${key}`, { value });
  }

  bulkUpdate(configs: { key: string; value: string }[]): Observable<SystemConfig[]> {
    return this.http.put<SystemConfig[]>(`${this.base}/bulk`, configs);
  }
}
