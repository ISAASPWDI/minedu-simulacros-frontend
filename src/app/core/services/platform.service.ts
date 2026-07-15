import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PlatformInfo } from '../models/platform.model';

@Injectable({ providedIn: 'root' })
export class PlatformService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/platform`;

  getInfo(): Observable<PlatformInfo> {
    return this.http.get<{ data: PlatformInfo }>(`${this.base}/info`).pipe(
      map(res => res.data)
    );
  }
}
