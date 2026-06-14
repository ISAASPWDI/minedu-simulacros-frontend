import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ExamConfig, ExamDetail, Specialty } from '../models/exam.model';
import { PageResponse } from '../models/config.model';

@Injectable({ providedIn: 'root' })
export class ExamService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/exams`;

  getExams(params?: { year?: number; level?: string; specialty?: string; page?: number; size?: number }): Observable<PageResponse<ExamConfig>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.year) httpParams = httpParams.set('year', params.year.toString());
      if (params.level) httpParams = httpParams.set('level', params.level);
      if (params.specialty) httpParams = httpParams.set('specialty', params.specialty);
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    }
    return this.http.get<PageResponse<ExamConfig>>(this.base, { params: httpParams });
  }

  getExamDetail(id: string): Observable<ExamDetail> {
    return this.http.get<ExamDetail>(`${this.base}/${id}`);
  }

  getYears(): Observable<number[]> {
    return this.http.get<number[]>(`${this.base}/years`);
  }

  getSpecialties(): Observable<Specialty[]> {
    return this.http.get<Specialty[]>(`${environment.apiUrl}/specialties`);
  }

  createExam(data: Partial<ExamConfig>): Observable<ExamConfig> {
    return this.http.post<ExamConfig>(`${environment.apiUrl}/admin/exams`, data);
  }

  bulkCreateQuestions(examId: string, questions: any[]): Observable<any> {
    return this.http.post(`${environment.apiUrl}/admin/exams/${examId}/questions/bulk`, questions);
  }

  toggleExamActive(examId: string): Observable<ExamConfig> {
    return this.http.patch<ExamConfig>(`${environment.apiUrl}/admin/exams/${examId}/toggle`, {});
  }

  updateExamDuration(examId: string, durationMinutes: number): Observable<ExamConfig> {
    return this.http.patch<ExamConfig>(`${environment.apiUrl}/admin/exams/${examId}/duration`, { durationMinutes });
  }

  getExamWithAnswers(examId: string): Observable<ExamDetail> {
    return this.http.get<ExamDetail>(`${environment.apiUrl}/admin/exams/${examId}/answers`);
  }
}
