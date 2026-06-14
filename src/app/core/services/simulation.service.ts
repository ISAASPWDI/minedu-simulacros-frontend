import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionStart, AnswerFeedback, SessionResult, UserStats, SessionSummary } from '../models/simulation.model';
import { PageResponse } from '../models/config.model';

@Injectable({ providedIn: 'root' })
export class SimulationService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/sessions`;

  startSession(examId: string, escalaMagisterial: string): Observable<SessionStart> {
    return this.http.post<SessionStart>(this.base, { examId, escalaMagisterial });
  }

  submitAnswer(sessionId: string, questionId: string, answer: string): Observable<AnswerFeedback> {
    return this.http.post<AnswerFeedback>(`${this.base}/${sessionId}/answers`, { questionId, answer });
  }

  finishSession(sessionId: string): Observable<SessionResult> {
    return this.http.post<SessionResult>(`${this.base}/${sessionId}/finish`, {});
  }

  getResult(sessionId: string): Observable<SessionResult> {
    return this.http.get<SessionResult>(`${this.base}/${sessionId}/result`);
  }

  getHistory(page: number = 0, size: number = 10): Observable<PageResponse<SessionSummary>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<PageResponse<SessionSummary>>(`${this.base}/history`, { params });
  }

  getStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.base}/stats`);
  }

  abandonSession(sessionId: string): Observable<void> {
    return this.http.post<void>(`${this.base}/${sessionId}/abandon`, {});
  }
}
