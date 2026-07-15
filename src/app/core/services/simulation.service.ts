import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SessionStart, AnswerFeedback, SessionResult, UserStats, SessionSummary, SessionResume } from '../models/simulation.model';
import { PageResponse } from '../models/config.model';

@Injectable({ providedIn: 'root' })
export class SimulationService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/simulation/sessions`;

  startSession(examConfigId: string, escala: string): Observable<SessionStart> {
    return this.http.post<any>(this.base, { examConfigId, escala }).pipe(map(r => r.data));
  }

  submitAnswer(sessionId: string, questionId: string, selectedAnswer: string): Observable<AnswerFeedback> {
    return this.http.post<any>(`${this.base}/${sessionId}/answers`, { questionId, selectedAnswer }).pipe(map(r => r.data));
  }

  finishSession(sessionId: string): Observable<SessionResult> {
    return this.http.post<any>(`${this.base}/${sessionId}/finish`, {}).pipe(map(r => r.data));
  }

  resumeSession(sessionId: string): Observable<SessionResume> {
    return this.http.get<any>(`${this.base}/${sessionId}/resume`).pipe(map(r => r.data));
  }

  getActiveSession(): Observable<SessionResume | null> {
    return this.http.get<any>(`${this.base}/active`).pipe(map(r => r.data));
  }

  getResult(sessionId: string): Observable<SessionResult> {
    return this.http.get<any>(`${this.base}/${sessionId}/result`).pipe(map(r => r.data));
  }

  getHistory(page: number = 0, size: number = 10): Observable<PageResponse<SessionSummary>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<any>(`${this.base}/my-history`, { params }).pipe(map(r => r.data));
  }

  getStats(): Observable<UserStats> {
    return this.http.get<any>(`${this.base}/stats`).pipe(map(r => r.data));
  }

  abandonSession(sessionId: string): Observable<void> {
    return this.http.post<any>(`${this.base}/${sessionId}/abandon`, {}).pipe(map(r => r.data));
  }
}
