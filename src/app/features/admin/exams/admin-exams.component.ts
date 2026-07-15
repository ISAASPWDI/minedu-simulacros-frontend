import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ExamService } from '../../../core/services/exam.service';
import { ExamConfig, Specialty } from '../../../core/models/exam.model';
import { NivelPipe } from '../../../shared/pipes/nivel.pipe';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-admin-exams',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, TableModule, TagModule, ToastModule, DialogModule, InputTextModule, Select, TooltipModule, NivelPipe, PageHeaderComponent],
  providers: [MessageService],
  templateUrl: './admin-exams.component.html',
  styleUrl: './admin-exams.component.scss'
})
export class AdminExamsComponent implements OnInit {
  private examService = inject(ExamService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  exams = signal<ExamConfig[]>([]);
  specialties = signal<Specialty[]>([]);
  loading = signal(true);
  toggling = signal<string | null>(null);

  showCreateDialog = signal(false);
  creating = signal(false);

  showUploadDialog = signal(false);
  uploadExam = signal<ExamConfig | null>(null);
  questionsJson = signal('');
  uploading = signal(false);

  showDurationDialog = signal(false);
  durationExam = signal<ExamConfig | null>(null);
  newDuration = signal(60);
  savingDuration = signal(false);

  levelOptions = [
    { label: 'EBR Primaria', value: 'PRIMARIA' },
    { label: 'EBR Secundaria', value: 'SECUNDARIA' }
  ];

  createForm = this.fb.group({
    code: ['', Validators.required],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
    level: ['PRIMARIA', Validators.required],
    specialtyId: ['', Validators.required],
    formNumber: [1, Validators.required],
    durationMinutes: [180, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.loadExams();
    this.examService.getSpecialties().subscribe(s => this.specialties.set(s));
  }

  loadExams(): void {
    this.loading.set(true);
    this.examService.getExams({ size: 100 }).subscribe({
      next: (page) => { this.exams.set(page.content); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  createExam(): void {
    if (this.createForm.invalid) { this.createForm.markAllAsTouched(); return; }
    this.creating.set(true);
    this.examService.createExam(this.createForm.value).subscribe({
      next: (exam) => {
        this.creating.set(false);
        this.showCreateDialog.set(false);
        this.createForm.reset({ year: new Date().getFullYear(), level: 'PRIMARIA', formNumber: 1, durationMinutes: 180 });
        this.exams.update(list => [exam, ...list]);
        this.messageService.add({ severity: 'success', summary: 'Creado', detail: `Examen ${exam.code} creado.` });
      },
      error: (err) => {
        this.creating.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo crear el examen.' });
      }
    });
  }

  toggleActive(exam: ExamConfig): void {
    this.toggling.set(exam.id);
    this.examService.toggleExamActive(exam.id).subscribe({
      next: (updated) => {
        this.toggling.set(null);
        this.exams.update(list => list.map(e => e.id === updated.id ? updated : e));
      },
      error: () => {
        this.toggling.set(null);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado.' });
      }
    });
  }

  openEditor(exam: ExamConfig): void {
    this.router.navigate(['/admin/exams', exam.id]);
  }

  openUpload(exam: ExamConfig): void {
    this.uploadExam.set(exam);
    this.questionsJson.set('');
    this.showUploadDialog.set(true);
  }

  uploadQuestions(): void {
    const exam = this.uploadExam();
    if (!exam) return;
    let questions: any[];
    try {
      questions = JSON.parse(this.questionsJson());
    } catch {
      this.messageService.add({ severity: 'error', summary: 'JSON inválido', detail: 'El formato del JSON no es válido.' });
      return;
    }
    this.uploading.set(true);
    this.examService.bulkCreateQuestions(exam.id, questions).subscribe({
      next: () => {
        this.uploading.set(false);
        this.showUploadDialog.set(false);
        this.messageService.add({ severity: 'success', summary: 'Preguntas cargadas', detail: `Se cargaron ${questions.length} preguntas.` });
      },
      error: (err) => {
        this.uploading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudieron cargar las preguntas.' });
      }
    });
  }

  openDuration(exam: ExamConfig): void {
    this.durationExam.set(exam);
    this.newDuration.set(exam.durationMinutes);
    this.showDurationDialog.set(true);
  }

  saveDuration(): void {
    const exam = this.durationExam();
    if (!exam) return;
    this.savingDuration.set(true);
    this.examService.updateExamDuration(exam.id, this.newDuration()).subscribe({
      next: (updated) => {
        this.savingDuration.set(false);
        this.showDurationDialog.set(false);
        this.exams.update(list => list.map(e => e.id === updated.id ? updated : e));
        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Duración actualizada.' });
      },
      error: () => {
        this.savingDuration.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar la duración.' });
      }
    });
  }

  get specialtyOptions() {
    return this.specialties().map(s => ({ label: s.name, value: s.id }));
  }
}
