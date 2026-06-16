import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SimulationService } from '../../../core/services/simulation.service';
import { QuestionForSession, SessionStart } from '../../../core/models/simulation.model';

@Component({
  selector: 'app-simulation',
  standalone: true,
  imports: [CommonModule, ButtonModule, ConfirmDialogModule, ToastModule, ProgressBarModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './simulation.component.html',
  styleUrl: './simulation.component.scss'
})
export class SimulationComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private simulationService = inject(SimulationService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  sessionId = signal('');
  session = signal<SessionStart | null>(null);
  questions = signal<QuestionForSession[]>([]);
  currentIndex = signal(0);
  timeRemaining = signal(0);
  loading = signal(true);
  submitting = signal(false);
  navExpanded = signal(true);

  private timerInterval: any = null;

  currentQuestion = computed(() => this.questions()[this.currentIndex()] ?? null);
  answeredCount = computed(() => this.questions().filter(q => q.answered).length);

  timerDisplay = computed(() => {
    const secs = this.timeRemaining();
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
  });

  timerClass = computed(() => {
    const secs = this.timeRemaining();
    if (secs <= 60) return 'danger';
    if (secs <= 300) return 'warning';
    return '';
  });

  progressValue = computed(() => {
    const total = this.questions().length;
    if (total === 0) return 0;
    return Math.round((this.answeredCount() / total) * 100);
  });

  private storageKey(id: string): string {
    return `sim_session_${id}`;
  }

  private saveToStorage(): void {
    const id = this.sessionId();
    if (!id) return;
    const snapshot = {
      session: this.session(),
      questions: this.questions(),
      startedAt: this.startedAt,
      currentIndex: this.currentIndex()
    };
    localStorage.setItem(this.storageKey(id), JSON.stringify(snapshot));
  }

  private loadFromStorage(id: string): boolean {
    const raw = localStorage.getItem(this.storageKey(id));
    if (!raw) return false;
    try {
      const snapshot = JSON.parse(raw);
      const elapsed = Math.floor((Date.now() - snapshot.startedAt) / 1000);
      const totalSecs = snapshot.session.durationMinutes * 60;
      const remaining = totalSecs - elapsed;
      if (remaining <= 0) {
        localStorage.removeItem(this.storageKey(id));
        return false;
      }
      this.session.set(snapshot.session);
      this.questions.set(snapshot.questions);
      this.startedAt = snapshot.startedAt;
      this.timeRemaining.set(remaining);
      this.currentIndex.set(snapshot.currentIndex ?? 0);
      this.loading.set(false);
      this.startTimer();
      return true;
    } catch {
      localStorage.removeItem(this.storageKey(id));
      return false;
    }
  }

  private startedAt = 0;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('sessionId') ?? '';
    this.sessionId.set(id);

    const state = window.history.state as { sessionData?: SessionStart };
    if (state?.sessionData) {
      this.initSession(state.sessionData);
    } else if (id && this.loadFromStorage(id)) {
      // restored from localStorage — already initialized
    } else {
      this.loading.set(false);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar la sesión. Inicia el simulacro desde la selección de exámenes.',
        life: 5000
      });
      setTimeout(() => this.router.navigate(['/teacher/exams']), 3000);
    }
  }

  initSession(sessionData: SessionStart): void {
    this.session.set(sessionData);
    this.questions.set(
      [...sessionData.questions]
        .sort((a, b) => a.number - b.number)
        .map(q => ({ ...q, answered: false, selectedAnswer: undefined }))
    );
    this.startedAt = Date.now();
    this.timeRemaining.set(sessionData.durationMinutes * 60);
    this.loading.set(false);
    this.saveToStorage();
    this.startTimer();
  }

  private tickCount = 0;

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      const current = this.timeRemaining();
      if (current <= 0) {
        clearInterval(this.timerInterval);
        this.autoFinish();
        return;
      }
      this.timeRemaining.update(t => t - 1);
      this.tickCount++;
      if (this.tickCount % 10 === 0) this.saveToStorage();
    }, 1000);
  }

  autoFinish(): void {
    this.messageService.add({ severity: 'warn', summary: 'Tiempo agotado', detail: 'El tiempo ha terminado. Finalizando examen...' });
    setTimeout(() => this.finishSession(), 1500);
  }

  selectAnswer(option: string): void {
    const q = this.currentQuestion();
    if (!q || this.submitting()) return;
    this.submitting.set(true);

    this.questions.update(qs => qs.map(item =>
      item.id === q.id ? { ...item, selectedAnswer: option, answered: true } : item
    ));

    this.simulationService.submitAnswer(this.sessionId(), q.id, option).subscribe({
      next: () => { this.submitting.set(false); this.saveToStorage(); },
      error: () => {
        this.submitting.set(false);
        this.questions.update(qs => qs.map(item =>
          item.id === q.id ? { ...item, selectedAnswer: undefined, answered: false } : item
        ));
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la respuesta.' });
      }
    });
  }

  prevQuestion(): void {
    if (this.currentIndex() > 0) this.currentIndex.update(i => i - 1);
  }

  nextQuestion(): void {
    if (this.currentIndex() < this.questions().length - 1) this.currentIndex.update(i => i + 1);
  }

  goToQuestion(index: number): void {
    this.currentIndex.set(index);
  }

  confirmFinish(): void {
    this.confirmationService.confirm({
      message: `Has respondido ${this.answeredCount()} de ${this.questions().length} preguntas. ¿Deseas finalizar el examen?`,
      header: 'Finalizar Examen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Finalizar',
      rejectLabel: 'Continuar',
      accept: () => this.finishSession()
    });
  }

  finishSession(): void {
    clearInterval(this.timerInterval);
    localStorage.removeItem(this.storageKey(this.sessionId()));
    this.simulationService.finishSession(this.sessionId()).subscribe({
      next: () => this.router.navigate(['/teacher/results', this.sessionId()]),
      error: (err) => {
        const msg = err.error?.message || 'Error al finalizar el examen';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }

  pad(n: number): string {
    return n.toString().padStart(2, '0');
  }

  getQuestionStatus(q: QuestionForSession): string {
    if (q.answered) return 'answered';
    return 'unanswered';
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }
}
