import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ExamService } from '../../../core/services/exam.service';
import { SimulationService } from '../../../core/services/simulation.service';
import { PaymentService } from '../../../core/services/payment.service';
import { ExamConfig, Specialty } from '../../../core/models/exam.model';
import { NivelPipe } from '../../../shared/pipes/nivel.pipe';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-exam-selection',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, Select, SkeletonModule, DialogModule, TagModule, ToastModule, NivelPipe, PageHeaderComponent],
  providers: [MessageService],
  templateUrl: './exam-selection.component.html',
  styleUrl: './exam-selection.component.scss'
})
export class ExamSelectionComponent implements OnInit {
  private examService = inject(ExamService);
  private simulationService = inject(SimulationService);
  private paymentService = inject(PaymentService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  allExams = signal<ExamConfig[]>([]);
  years = signal<number[]>([]);
  specialties = signal<Specialty[]>([]);
  hasSubscription = signal(environment.mockSubscription ?? false);
  loading = signal(true);

  filterYear = signal<number | null>(null);
  filterLevel = signal<string | null>(null);
  filterSpecialty = signal<string | null>(null);

  exams = computed(() => {
    const year = this.filterYear();
    const level = this.filterLevel();
    const specialty = this.filterSpecialty();
    return this.allExams().filter(e => {
      if (year && e.year !== year) return false;
      if (level && e.level !== level) return false;
      if (specialty && e.specialtyName !== specialty) return false;
      return true;
    });
  });

  showDialog = signal(false);
  selectedExam = signal<ExamConfig | null>(null);
  selectedEscala = signal<string | null>(null);
  starting = signal(false);

  escalaOptions = [
    { label: '1ra Escala', value: 'PRIMERA' },
    { label: '2da Escala', value: 'SEGUNDA' },
    { label: '3ra Escala', value: 'TERCERA' },
    { label: '4ta Escala', value: 'CUARTA' },
    { label: '5ta Escala', value: 'QUINTA' },
    { label: '6ta Escala', value: 'SEXTA' },
    { label: '7ma Escala', value: 'SEPTIMA' },
    { label: '8va Escala', value: 'OCTAVA' }
  ];

  levelOptions = [
    { label: 'Todos', value: null },
    { label: 'EBR Primaria', value: 'PRIMARIA' },
    { label: 'EBR Secundaria', value: 'SECUNDARIA' }
  ];

  ngOnInit(): void {
    this.examService.getYears().subscribe(y => this.years.set(y));
    this.examService.getSpecialties().subscribe(s => this.specialties.set(s));
    if (!environment.mockSubscription) {
      this.paymentService.getSubscription().subscribe({
        next: (sub) => this.hasSubscription.set(sub?.isActive ?? false),
        error: () => this.hasSubscription.set(false)
      });
    }
    this.loadExams();
  }

  loadExams(): void {
    this.loading.set(true);
    this.examService.getExams().subscribe({
      next: (page) => { this.allExams.set(page.content); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onFilterChange(): void {
    // filters applied client-side via computed()
  }

  openExamDialog(exam: ExamConfig): void {
    if (!this.hasSubscription()) {
      this.messageService.add({ severity: 'warn', summary: 'Suscripción requerida', detail: 'Necesitas una suscripción activa para realizar simulacros.' });
      return;
    }
    this.selectedExam.set(exam);
    this.selectedEscala.set(null);
    this.showDialog.set(true);
  }

  startSimulation(): void {
    if (!this.selectedEscala() || !this.selectedExam()) return;
    this.starting.set(true);
    console.log(this.selectedExam()!.id, this.selectedEscala()!);

    this.simulationService.startSession(this.selectedExam()!.id, this.selectedEscala()!).subscribe({
      next: (result) => {
        this.starting.set(false);
        this.showDialog.set(false);
        this.router.navigate(['/teacher/simulation', result.sessionId], { state: { sessionData: result } });
      },
      error: (err) => {
        this.starting.set(false);
        const msg = err.error?.message || 'Error al iniciar el simulacro';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }

  get yearOptions() {
    return [{ label: 'Todos los años', value: null }, ...this.years().map(y => ({ label: y.toString(), value: y }))];
  }

  get specialtyOptions() {
    return [{ label: 'Todas las especialidades', value: null }, ...this.specialties().map(s => ({ label: s.name, value: s.name }))];
  }
}
