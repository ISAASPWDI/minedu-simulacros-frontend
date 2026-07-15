import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SystemConfig } from '../models/config.model';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/config`;

  getAllConfigs(): Observable<SystemConfig[]> {
    return this.http.get<{ data: SystemConfig[] }>(this.base).pipe(
      map(res => res.data)
    );
  }

  getConfig(key: string): Observable<SystemConfig> {
    return this.http.get<{ data: SystemConfig }>(`${this.base}/${key}`).pipe(
      map(res => res.data)
    );
  }

  updateConfig(key: string, value: string): Observable<SystemConfig> {
    return this.http.put<{ data: SystemConfig }>(`${this.base}/${key}`, { value }).pipe(
      map(res => res.data)
    );
  }
}
