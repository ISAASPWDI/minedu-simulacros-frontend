import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ExamConfig, ExamDetail, QuestionWithAnswer, Specialty } from '../models/exam.model';
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
    return this.http.get<Specialty[]>(`${this.base}/specialties`);
  }

  createExam(data: any): Observable<ExamConfig> {
    return this.http.post<ExamConfig>(this.base, data);
  }

  bulkCreateQuestions(examId: string, questions: any[]): Observable<any> {
    return this.http.post(`${this.base}/${examId}/questions`, questions);
  }

  toggleExamActive(examId: string): Observable<ExamConfig> {
    return this.http.put<ExamConfig>(`${this.base}/${examId}/toggle-active`, {});
  }

  updateExamDuration(examId: string, durationMinutes: number): Observable<ExamConfig> {
    const params = new HttpParams().set('minutes', durationMinutes.toString());
    return this.http.put<ExamConfig>(`${this.base}/${examId}/duration`, null, { params });
  }

  getQuestionsWithAnswers(examId: string): Observable<QuestionWithAnswer[]> {
    return this.http.get<QuestionWithAnswer[]>(`${this.base}/${examId}/questions-admin`);
  }

  addQuestion(examId: string, data: Partial<QuestionWithAnswer>): Observable<QuestionWithAnswer> {
    return this.http.post<QuestionWithAnswer>(`${this.base}/${examId}/questions/single`, data);
  }

  updateQuestion(examId: string, questionId: string, data: Partial<QuestionWithAnswer>): Observable<QuestionWithAnswer> {
    return this.http.put<QuestionWithAnswer>(`${this.base}/${examId}/questions/${questionId}`, data);
  }

  deleteQuestion(examId: string, questionId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${examId}/questions/${questionId}`);
  }

  uploadImage(file: File): Observable<string> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post(`${this.base}/images/upload`, form, { responseType: 'text' });
  }
}
